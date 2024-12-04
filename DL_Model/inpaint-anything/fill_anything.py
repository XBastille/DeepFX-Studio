import sys
import argparse
import numpy as np
import torch
import torch
from controlnet_flux import FluxControlNetModel
from transformer_flux import FluxTransformer2DModel
from pipeline_flux_controlnet_inpaint import FluxControlNetInpaintingPipeline
from pathlib import Path
from matplotlib import pyplot as plt
from PIL import Image

from sam_segment import predict_masks_with_sam
from utils import load_img_to_array, save_array_to_img, dilate_mask, \
    show_mask, show_points, get_clicked_point


def setup_args(parser):
    parser.add_argument(
        "--input_img", type=str, required=True,
        help="Path to a single input img",
    )
    parser.add_argument(
        "--coords_type", type=str, required=True,
        default="key_in", choices=["click", "key_in"], 
        help="The way to select coords",
    )
    parser.add_argument(
        "--point_coords", type=float, nargs='+', required=True,
        help="The coordinate of the point prompt, [coord_W coord_H].",
    )
    parser.add_argument(
        "--point_labels", type=int, nargs='+', required=True,
        help="The labels of the point prompt, 1 or 0.",
    )
    parser.add_argument(
        "--text_prompt", type=str, required=True,
        help="Text prompt",
    )
    parser.add_argument(
        "--dilate_kernel_size", type=int, default=None,
        help="Dilate kernel size. Default: None",
    )
    parser.add_argument(
        "--output_dir", type=str, required=True,
        help="Output path to the directory with results.",
    )
    parser.add_argument(
        "--sam_model_type", type=str,
        default="vit_h", choices=['vit_h', 'vit_l', 'vit_b', 'vit_t'],
        help="The type of sam model to load. Default: 'vit_h"
    )
    parser.add_argument(
        "--sam_ckpt", type=str, required=True,
        help="The path to the SAM checkpoint to use for mask generation.",
    )
    parser.add_argument(
        "--seed", type=int,
        help="Specify seed for reproducibility.",
    )
    parser.add_argument(
        "--deterministic", action="store_true",
        help="Use deterministic algorithms for reproducibility.",
    )
    parser.add_argument(
        "--controlnet_scale", type=float, default=0.9,
        help="ControlNet conditioning scale"
    )
    parser.add_argument(
        "--guidance_scale", type=float, default=3.5,
        help="Guidance scale for stable diffusion"
    )


if __name__ == "__main__":
    """Example usage:
    python fill_anything.py \
        --input_img FA_demo/FA1_dog.png \
        --coords_type key_in \
        --point_coords 750 500 \
        --point_labels 1 \
        --text_prompt "a teddy bear on a bench" \
        --dilate_kernel_size 15 \
        --output_dir ./results \
        --sam_model_type "vit_h" \
        --sam_ckpt sam_vit_h_4b8939.pth 
    """
    parser = argparse.ArgumentParser()
    setup_args(parser)
    args = parser.parse_args(sys.argv[1:])
    device = "cuda" if torch.cuda.is_available() else "cpu"

    if args.coords_type == "click":
        latest_coords = get_clicked_point(args.input_img)
    elif args.coords_type == "key_in":
        latest_coords = args.point_coords
    img = load_img_to_array(args.input_img)

    masks, _, _ = predict_masks_with_sam(
        img,
        [latest_coords],
        args.point_labels,
        model_type=args.sam_model_type,
        ckpt_p=args.sam_ckpt,
        device=device,
    )
    masks = masks.astype(np.uint8) * 255

    # dilate mask to avoid unmasked edge effect
    if args.dilate_kernel_size is not None:
        masks = [dilate_mask(mask, args.dilate_kernel_size) for mask in masks]

    # visualize the segmentation results
    img_stem = Path(args.input_img).stem
    out_dir = Path(args.output_dir) / img_stem
    out_dir.mkdir(parents=True, exist_ok=True)
    for idx, mask in enumerate(masks):
        # path to the results
        mask_p = out_dir / f"mask_{idx}.png"
        img_points_p = out_dir / f"with_points.png"
        img_mask_p = out_dir / f"with_{Path(mask_p).name}"

        # save the mask
        save_array_to_img(mask, mask_p)

        # save the pointed and masked image
        dpi = plt.rcParams['figure.dpi']
        height, width = img.shape[:2]
        plt.figure(figsize=(width/dpi/0.77, height/dpi/0.77))
        plt.imshow(img)
        plt.axis('off')
        show_points(plt.gca(), [latest_coords], args.point_labels,
                    size=(width*0.04)**2)
        plt.savefig(img_points_p, bbox_inches='tight', pad_inches=0)
        show_mask(plt.gca(), mask, random_color=False)
        plt.savefig(img_mask_p, bbox_inches='tight', pad_inches=0)
        plt.close()
    controlnet = FluxControlNetModel.from_pretrained(
        "alimama-creative/FLUX.1-dev-Controlnet-Inpainting-Beta", 
        torch_dtype=torch.bfloat16
    )

    transformer = FluxTransformer2DModel.from_pretrained(
        "black-forest-labs/FLUX.1-dev", 
        subfolder='transformer', 
        torch_dtype=torch.bfloat16
    )
    
    pipe = FluxControlNetInpaintingPipeline.from_pretrained(
        "black-forest-labs/FLUX.1-dev",
        controlnet=controlnet,
        transformer=transformer,
        torch_dtype=torch.bfloat16
    ).to(device)
    
    pipe.tokenizer.add_prefix_space = True
    
    pipe.transformer.to(torch.bfloat16)
    pipe.controlnet.to(torch.bfloat16)

    # fill the masked image
    for idx, mask in enumerate(masks):
        if args.seed is not None:
            torch.manual_seed(args.seed)
            
        mask_p = out_dir / f"mask_{idx}.png"
        img_filled_p = out_dir / f"filled_with_{Path(mask_p).name}"
        original_size = img.shape[:2][::-1]
        
        # Convert numpy arrays to PIL and resize
        flux_size = (768, 768)
        image_pil = Image.fromarray(img).resize(flux_size)
        mask_pil = Image.fromarray(mask).resize(flux_size)
        
        # Generate inpainted image
        generator = torch.Generator(device=device).manual_seed(9)
        result = pipe(
            prompt=args.text_prompt,
            height=flux_size[1],
            width=flux_size[0],
            control_image=image_pil,
            control_mask=mask_pil,
            num_inference_steps=40,
            generator=generator,
            controlnet_conditioning_scale=args.controlnet_scale,
            guidance_scale=args.guidance_scale,
            negative_prompt="Low quality, Blurry, Overexposed, Underexposed, Grainy, Pixelated, Low resolution, Distorted, Over-saturated, Washed out",
            true_guidance_scale=1.0
        ).images[0]
        
        # Save result
        result = result.resize(original_size)
        result.save(img_filled_p) 

python fill_anything.py \
    --input_img anime_friends.jpg \
    --coords_type key_in \
    --point_coords 3031 1102 \
    --point_labels 1 \
    --text_prompt "albert einstein" \
    --dilate_kernel_size 50 \
    --output_dir ./results \
    --sam_model_type "vit_h" \
    --sam_ckpt ./pretrained_models/sam_vit_h_4b8939.pth
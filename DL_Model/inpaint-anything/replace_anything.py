import sys
import numpy as np
import torch
from pathlib import Path
from matplotlib import pyplot as plt
from PIL import Image

from sam_segment import predict_masks_with_sam
from utils import load_img_to_array, save_array_to_img, dilate_mask, \
    show_mask, show_points, get_clicked_point
from controlnet_flux import FluxControlNetModel
from transformer_flux import FluxTransformer2DModel
from pipeline_flux_controlnet_inpaint import FluxControlNetInpaintingPipeline

def process_image(
    input_img,
    coords_type,
    point_coords,
    point_labels,
    text_prompt,
    dilate_kernel_size,
    output_dir,
    sam_model_type,
    sam_ckpt,
    seed,
    deterministic,
    controlnet_scale,
    guidance_scale
):
    device = "cuda" if torch.cuda.is_available() else "cpu"

    if coords_type == "click":
        latest_coords = get_clicked_point(input_img)
    elif coords_type == "key_in":
        latest_coords = point_coords
    img = load_img_to_array(input_img)

    masks, _, _ = predict_masks_with_sam(
        img,
        [latest_coords],
        point_labels,
        model_type=sam_model_type,
        ckpt_p=sam_ckpt,
        device=device,
    )
    masks = masks.astype(np.uint8) * 255
    masks = [255 - mask for mask in masks]

    if dilate_kernel_size is not None:
        masks = [dilate_mask(mask, dilate_kernel_size) for mask in masks]

    img_stem = Path(input_img).stem
    out_dir = Path(output_dir) / img_stem
    out_dir.mkdir(parents=True, exist_ok=True)

    for idx, mask in enumerate(masks):
        mask_p = out_dir / f"mask_{idx}.png"
        img_points_p = out_dir / f"with_points.png"
        img_mask_p = out_dir / f"with_{Path(mask_p).name}"

        save_array_to_img(mask, mask_p)

        dpi = plt.rcParams['figure.dpi']
        height, width = img.shape[:2]
        plt.figure(figsize=(width/dpi/0.77, height/dpi/0.77))
        plt.imshow(img)
        plt.axis('off')
        show_points(plt.gca(), [latest_coords], point_labels,
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
    
    pipe.transformer.to(torch.bfloat16)
    pipe.controlnet.to(torch.bfloat16)
    pipe.tokenizer.add_prefix_space = True

    for idx, mask in enumerate(masks):
        if seed is not None:
            torch.manual_seed(seed)
            
        mask_p = out_dir / f"mask_{idx}.png"
        img_replaced_p = out_dir / f"replaced_with_{Path(mask_p).name}"
        original_size = img.shape[:2][::-1]
        
        flux_size = (768, 768)
        image_pil = Image.fromarray(img).resize(flux_size)
        mask_pil = Image.fromarray(mask).resize(flux_size)
        
        generator = torch.Generator(device=device).manual_seed(9)
        result = pipe(
            prompt=text_prompt,
            height=flux_size[1],
            width=flux_size[0],
            control_image=image_pil,
            control_mask=mask_pil,
            num_inference_steps=40,
            generator=generator,
            controlnet_conditioning_scale=controlnet_scale,
            guidance_scale=guidance_scale,
            negative_prompt="Low quality, Blurry, Overexposed, Underexposed, Grainy, Pixelated, Low resolution, Distorted, Over-saturated, Washed out",
            true_guidance_scale=1.0
        ).images[0]
        
        result = result.resize(original_size)
        result.save(img_replaced_p)

    print("Successfully completed replacement")

if __name__ == "__main__":
    # Define your inputs here
    input_img = "input.png"
    coords_type = "key_in"
    point_coords = [500, 375]
    point_labels = [1]
    text_prompt = "a white cat"
    dilate_kernel_size = 15
    output_dir = "./results"
    sam_model_type = "vit_h"
    sam_ckpt = "pretrained_models/sam_vit_h_4b8939.pth"
    seed = None
    deterministic = False
    controlnet_scale = 0.9
    guidance_scale = 3.5

    # Run the process
    process_image(
        input_img=input_img,
        coords_type=coords_type,
        point_coords=point_coords,
        point_labels=point_labels,
        text_prompt=text_prompt,
        dilate_kernel_size=dilate_kernel_size,
        output_dir=output_dir,
        sam_model_type=sam_model_type,
        sam_ckpt=sam_ckpt,
        seed=seed,
        deterministic=deterministic,
        controlnet_scale=controlnet_scale,
        guidance_scale=guidance_scale
    )

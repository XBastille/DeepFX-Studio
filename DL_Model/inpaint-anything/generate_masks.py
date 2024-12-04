import torch
import numpy as np
from pathlib import Path
from matplotlib import pyplot as plt

from sam_segment import predict_masks_with_sam
from utils import load_img_to_array, save_array_to_img, dilate_mask, \
    show_mask, show_points, get_clicked_point

def generate_masks(
    input_img,
    coords_type,
    point_coords,
    point_labels,
    dilate_kernel_size,
    output_dir,
    sam_model_type,
    sam_ckpt,
    operation_type="fill"  
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

    if operation_type == "replace":
        masks = [255 - mask for mask in masks]

    if dilate_kernel_size is not None:
        masks = [dilate_mask(mask, dilate_kernel_size) for mask in masks]

    img_stem = Path(input_img).stem
    out_dir = Path(output_dir) / img_stem
    out_dir.mkdir(parents=True, exist_ok=True)

    for idx, mask in enumerate(masks):
        mask_p = out_dir / f"mask_{idx}.png"
        img_points_p = out_dir / "with_points.png"
        img_mask_p = out_dir / f"with_mask_{idx}.png"

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

if __name__ == "__main__":
    input_img = "input_path"
    coords_type = "key_in"
    point_coords = [386, 270]
    point_labels = [1]
    dilate_kernel_size = 15
    output_dir = "./results"
    sam_model_type = "vit_h"
    sam_ckpt = "pretrained_models/sam_vit_h_4b8939.pth"
    operation_type = "replace"  # or "replace"

    generate_masks(
        input_img=input_img,
        coords_type=coords_type,
        point_coords=point_coords,
        point_labels=point_labels,
        dilate_kernel_size=dilate_kernel_size,
        output_dir=output_dir,
        sam_model_type=sam_model_type,
        sam_ckpt=sam_ckpt,
        operation_type=operation_type
    )

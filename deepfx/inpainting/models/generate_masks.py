import torch
import numpy as np
from pathlib import Path
from matplotlib import pyplot as plt

from inpainting.models.sam_segment import predict_masks_with_sam
from inpainting.models.utils import load_img_to_array, save_array_to_img, dilate_mask

def generate_masks(
    input_img,
    point_coords,
    point_labels,
    dilate_kernel_size,
    output_dir,
    sam_model_type,
    sam_ckpt,
    operation_type="fill"  
):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    img = load_img_to_array(input_img)

    print("Generate masks input shape:", img.shape)
    print("Point coords in generate_masks:", point_coords)
    

    point_coords = np.array(point_coords)
    point_coords = point_coords.reshape(1, 2)


    masks, _, _ = predict_masks_with_sam(
        img,
        point_coords,
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


    mask = masks[-1]

    mask_p = out_dir / f"mask.png"
    img_points_p = out_dir / "with_points.png"
    img_mask_p = out_dir / f"with_mask.png"

    save_array_to_img(mask, mask_p)

    return mask

if __name__ == "__main__":
    input_img = "test.jpg"
    point_coords = [2189, 2067]
    point_labels = [1]
    dilate_kernel_size = 15
    output_dir = "./results"
    sam_model_type = "vit_h"
    sam_ckpt = "pretrained_models/sam_vit_h_4b8939.pth"
    operation_type = "remove"  # or "replace"

    generate_masks(
        input_img=input_img,
        point_coords=point_coords,
        point_labels=point_labels,
        dilate_kernel_size=dilate_kernel_size,
        output_dir=output_dir,
        sam_model_type=sam_model_type,
        sam_ckpt=sam_ckpt,
        operation_type=operation_type
    )

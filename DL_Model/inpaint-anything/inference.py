import torch
import os
import numpy as np
from pathlib import Path
from matplotlib import pyplot as plt

from sam_segment import predict_masks_with_sam
from lama_inpaint import inpaint_img_with_lama
from utils import load_img_to_array, save_array_to_img, dilate_mask, show_mask, show_points, get_clicked_point

def check_folder(path):
    if not os.path.exists(path):
        os.makedirs(path)
    return path

def get_unique_output_path(input_path, output_dir):
    input_filename = os.path.splitext(os.path.basename(input_path))[0]
    output_subdir = os.path.join(output_dir, "inpainted")
    check_folder(output_subdir)
    
    base_path = os.path.join(output_subdir, f"{input_filename}.png")
    if not os.path.exists(base_path):
        return base_path
    
    counter = 1
    while os.path.exists(os.path.join(output_subdir, f"{input_filename}_{counter}.png")):
        counter += 1
    return os.path.join(output_subdir, f"{input_filename}_{counter}.png")

def process_image(input_path, point_coords, point_labels, sam_model_type="vit_h", sam_ckpt="sam_vit_h_4b8939.pth", 
                 lama_config="./lama/configs/prediction/default.yaml", lama_ckpt="big-lama", dilate_kernel_size=15):
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    img = load_img_to_array(input_path)
    
    # Generate mask using SAM
    masks, _, _ = predict_masks_with_sam(
        img,
        [point_coords],
        point_labels,
        model_type=sam_model_type,
        ckpt_p=sam_ckpt,
        device=device,
    )
    masks = masks.astype(np.uint8) * 255

    # Dilate mask
    if dilate_kernel_size is not None:
        masks = [dilate_mask(mask, dilate_kernel_size) for mask in masks]

    # Get output path
    output_path = get_unique_output_path(input_path, "outputs")
    
    # Inpaint the masked image
    for mask in masks:
        img_inpainted = inpaint_img_with_lama(
            img, mask, lama_config, lama_ckpt, device=device)
        save_array_to_img(img_inpainted, output_path)
    
    return output_path

if __name__ == "__main__":
    input_image = "inputs/image_name.png"
    point_coords = [750, 500]  # Example coordinates
    point_labels = [1]  # 1 for object to remove
    
    output_path = process_image(input_image, point_coords, point_labels)
    print(f"Image saved to: {output_path}")


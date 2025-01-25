import torch
from pathlib import Path
from lama_inpaint import inpaint_img_with_lama
from utils import load_img_to_array, save_array_to_img

def apply_removal(
    input_img,
    mask_mode,
    masks_dir,
    lama_config,
    lama_ckpt
):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    img = load_img_to_array(input_img)
    masks_dir = Path(masks_dir)
    
    if not masks_dir.exists():
        raise ValueError(f"Masks directory not found: {masks_dir}")
        
    if mask_mode == "sam":
        mask_files = list(masks_dir.glob("mask_*.png"))
    else:  
        mask_files = list(masks_dir.glob("mask_0.png"))
        
    if not mask_files:
        raise ValueError(f"No mask files found in {masks_dir}")

    for mask_file in mask_files:
        mask = load_img_to_array(mask_file)
        img_inpainted_p = masks_dir / f"inpainted_with_{mask_file.name}"
        img_inpainted = inpaint_img_with_lama(
            img, mask, lama_config, lama_ckpt, device=device)
        save_array_to_img(img_inpainted, img_inpainted_p)

if __name__ == "__main__":
    input_img = "input_path"
    img_stem = Path(input_img).stem
    masks_dir = f"./results/{img_stem}"
    lama_config = "lama/configs/prediction/default.yaml"
    lama_ckpt = "pretrained_models/big-lama"
    mask_mode = "manual"  # or "sam"

    apply_removal(
        input_img=input_img,
        mask_mode=mask_mode,
        masks_dir=masks_dir,
        lama_config=lama_config,
        lama_ckpt=lama_ckpt
    )

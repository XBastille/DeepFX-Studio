import torch
from pathlib import Path
from ai_image_editor.models.lama_inpaint import inpaint_img_with_lama
from ai_image_editor.models.utils import load_img_to_array, save_array_to_img

def apply_removal(
    input_img,
    masks_dir,
    lama_config,
    lama_ckpt
):
    device = "cuda" if torch.cuda.is_available() else "cpu"
    img = load_img_to_array(input_img)
    masks_dir = Path(masks_dir)
    
    if not masks_dir.exists():
        raise ValueError(f"Masks directory not found: {masks_dir}")
        
    mask_file = masks_dir / "mask.png"
        
    if not mask_file.exists():
        raise ValueError(f"No mask files found in {masks_dir}")

    mask = load_img_to_array(mask_file)
    img_inpainted_p = masks_dir / "inpainted.png"
    img_inpainted = inpaint_img_with_lama(
        img, mask, lama_config, lama_ckpt, device=device)
    save_array_to_img(img_inpainted, img_inpainted_p)

if __name__ == "__main__":
    input_img = "test.jpg"
    img_stem = Path(input_img).stem
    masks_dir = f"./results/{img_stem}"
    lama_config = "lama/configs/prediction/default.yaml"
    lama_ckpt = "pretrained_models/big-lama"

    apply_removal(
        input_img=input_img,
        masks_dir=masks_dir,
        lama_config=lama_config,
        lama_ckpt=lama_ckpt
    )

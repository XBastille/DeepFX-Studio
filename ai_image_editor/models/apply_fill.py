from pathlib import Path
import torch
from PIL import Image
import logging
from core.dependency_manager import ensure_flux_inpaint_environment, ModelType
from core.task_queue import add_task, get_task_status
from ai_image_editor.models.utils import load_img_to_array

logger = logging.getLogger(__name__)

def _apply_fill_internal(
    negative_prompt,
    input_img,
    masks_dir,
    text_prompt,
    controlnet_scale=0.9,
    guidance_scale=3.5,
    num_inference_steps=40,
    seed=None,
):
    """Internal function for actual FLUX inpainting"""
    from ai_image_editor.models.controlnet_flux import FluxControlNetModel
    from ai_image_editor.models.pipeline_flux_controlnet_inpaint import (
        FluxControlNetInpaintingPipeline,
    )
    from ai_image_editor.models.transformer_flux import FluxTransformer2DModel
    
    device = "cuda" if torch.cuda.is_available() else "cpu"
    img = load_img_to_array(input_img)
    masks_dir = Path(masks_dir)

    if not masks_dir.exists():
        raise ValueError(f"Masks directory not found: {masks_dir}")

    mask_file = masks_dir / "mask.png"

    if not mask_file.exists():
        raise ValueError(f"No mask files found in {masks_dir}")

    logger.info("Loading FLUX inpaint models...")
    controlnet = FluxControlNetModel.from_pretrained(
        "alimama-creative/FLUX.1-dev-Controlnet-Inpainting-Beta",
        torch_dtype=torch.bfloat16,
    )

    transformer = FluxTransformer2DModel.from_pretrained(
        "black-forest-labs/FLUX.1-dev",
        subfolder="transformer",
        torch_dtype=torch.bfloat16,
    )

    pipe = FluxControlNetInpaintingPipeline.from_pretrained(
        "black-forest-labs/FLUX.1-dev",
        controlnet=controlnet,
        transformer=transformer,
        torch_dtype=torch.bfloat16,
    ).to(device)

    pipe.tokenizer.add_prefix_space = True
    pipe.transformer.to(torch.bfloat16)
    pipe.controlnet.to(torch.bfloat16)

    if seed is not None:
        torch.manual_seed(seed)

    mask = load_img_to_array(mask_file)
    img_filled_p = masks_dir / f"filled_with_{mask_file.name}"
    original_size = img.shape[:2][::-1]

    flux_size = (768, 768)
    image_pil = Image.fromarray(img).resize(flux_size)
    mask_pil = Image.fromarray(mask).resize(flux_size)

    generator = torch.Generator(device=device).manual_seed(1)
    
    logger.info("Running FLUX inpainting...")
    result = pipe(
        prompt=text_prompt,
        height=flux_size[1],
        width=flux_size[0],
        control_image=image_pil,
        control_mask=mask_pil,
        num_inference_steps=num_inference_steps,
        generator=generator,
        controlnet_conditioning_scale=controlnet_scale,
        guidance_scale=guidance_scale,
        negative_prompt=negative_prompt,
        true_guidance_scale=1.0,
    ).images[0]

    result = result.resize(original_size)
    result.save(img_filled_p)
    
    return str(img_filled_p)

def apply_fill(
    negative_prompt,
    input_img,
    masks_dir,
    text_prompt,
    controlnet_scale=0.9,
    guidance_scale=3.5,
    num_inference_steps=40,
    seed=None,
):
    """Apply FLUX inpainting with smart dependency management"""
    
    env_status = ensure_flux_inpaint_environment(wait=False)
    
    if env_status["ready"]:
        logger.info("FLUX inpaint environment ready, processing...")
        return _apply_fill_internal(
            negative_prompt, input_img, masks_dir, text_prompt,
            controlnet_scale, guidance_scale, num_inference_steps, seed
        )
    
    elif env_status["downloading"]:
        logger.info("FLUX inpaint environment being prepared, adding to queue...")
        task_id = add_task(
            "flux_inpaint",
            _apply_fill_internal,
            negative_prompt, input_img, masks_dir, text_prompt,
            controlnet_scale, guidance_scale, num_inference_steps, seed
        )
        
        return {
            "task_id": task_id,
            "status": "queued",
            "message": "FLUX inpaint environment is being prepared. Your inpainting task has been queued and will start automatically once ready."
        }
    
    else:
        logger.info("Starting FLUX inpaint environment preparation...")
        task_id = add_task(
            "flux_inpaint",
            _apply_fill_internal,
            negative_prompt, input_img, masks_dir, text_prompt,
            controlnet_scale, guidance_scale, num_inference_steps, seed
        )
        
        ensure_flux_inpaint_environment(wait=False)
        
        return {
            "task_id": task_id,
            "status": "queued", 
            "message": "Preparing FLUX inpaint environment (diffusers v0.30.2) and queuing your task. This may take a few minutes on first use."
        }

def get_inpaint_status(task_id):
    """Get the status of a queued inpaint task"""
    return get_task_status(task_id)


if __name__ == "__main__":
    input_img = "test.jpg"
    img_stem = Path(input_img).stem
    masks_dir = f"./results/{img_stem}"
    text_prompt = "front view of a blond woman with a warm smile"

    apply_fill(
        input_img=input_img,
        masks_dir=masks_dir,
        text_prompt=text_prompt,
        controlnet_scale=0.9,
        guidance_scale=3.5,
        num_inference_steps=40,
        negative_prompt="Low quality, Blurry, Overexposed, Underexposed, Grainy, Pixelated, Low resolution, Distorted, Over-saturated, Washed out",
        seed=None,
    )

#!/usr/bin/env python3

import os
import sys
from huggingface_hub import snapshot_download, login
from diffusers import StableDiffusion3Pipeline
from ai_image_editor.models.controlnet_flux import FluxControlNetModel
from ai_image_editor.models.transformer_flux import FluxTransformer2DModel

def main():
    hf_token = os.getenv('HF_TOKEN')
    if not hf_token:
        print("Error: HF_TOKEN environment variable not set!")
        print("Please set your HuggingFace token for gated models.")
        sys.exit(1)
    
    try:
        login(token=hf_token)
        print("Successfully logged into HuggingFace")
    except Exception as e:
        print(f"Failed to login to HuggingFace: {e}")
        sys.exit(1)
    
    models_to_download = [
        "stabilityai/stable-diffusion-3.5-large",
        "black-forest-labs/FLUX.1-dev", 
        "alimama-creative/FLUX.1-dev-Controlnet-Inpainting-Beta"
    ]
    
    print("Starting model downloads...")
    
    for model_id in models_to_download:
        try:
            print(f"Downloading {model_id}...")
            snapshot_download(
                repo_id=model_id,
                cache_dir="/app/.cache/huggingface",
                token=hf_token,
                resume_download=True
            )
            print(f"Successfully downloaded {model_id}")
        except Exception as e:
            print(f"Failed to download {model_id}: {e}")
    
    print("Model download process completed!")

if __name__ == "__main__":
    main()
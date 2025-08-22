import os
import torch
from gradio_client import Client
from diffusers import StableDiffusion3Pipeline
import shutil
import uuid

def get_pipeline():
    """Get or create the Diffusers pipeline"""
    pipeline = StableDiffusion3Pipeline.from_pretrained(
        "stabilityai/stable-diffusion-3.5-large",
        torch_dtype=torch.bfloat16
    )
    pipeline = pipeline.to("cuda")
    return pipeline

def generate_images_batch(prompt, negative_prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps, num_images):
    """Generate multiple images in a single batch - MUCH faster than sequential"""
    output_paths = []
    output_dir = os.path.join('static', 'images')
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        print("Attempting batch generation with Gradio...")
        client = Client("stabilityai/stable-diffusion-3.5-large")
        
        for i in range(num_images):
            current_seed = seed + i if not randomize_seed else None
            
            result = client.predict(
                prompt=prompt,
                negative_prompt=negative_prompt,
                seed=current_seed,
                randomize_seed=randomize_seed,
                width=width,
                height=height,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps,
                api_name="/infer"
            )
            
            output_path = os.path.join(output_dir, f'generated_image_{uuid.uuid4()}.png')
            shutil.copy(result[0], output_path)
            output_paths.append(output_path)
            print(f"Generated image {i + 1}/{num_images} via Gradio")
            
        return output_paths
        
    except Exception as e:
        print(f"Gradio failed: {e}")
        print("Falling back to local Diffusers pipeline...")
    
    try:
        pipeline = get_pipeline()
        
        if not randomize_seed and seed is not None:
            generator = torch.Generator("cuda").manual_seed(seed)
        else:
            generator = None
        
        print(f"Generating {num_images} images in batch...")
        images = pipeline(
            prompt=[prompt] * num_images,  
            negative_prompt=[negative_prompt] * num_images if negative_prompt else None,
            width=width,
            height=height,
            guidance_scale=guidance_scale,
            num_inference_steps=num_inference_steps,
            generator=generator,
            num_images_per_prompt=1
        ).images
        
        for i, image in enumerate(images):
            output_path = os.path.join(output_dir, f'generated_image_{uuid.uuid4()}.png')
            image.save(output_path)
            output_paths.append(output_path)
            print(f"Saved image {i + 1}/{num_images}")
            
        return output_paths
        
    except Exception as e:
        print(f"Batch generation failed: {e}")
        return []

def generate_images(prompt, negative_prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps, num_images):
    return generate_images_batch(prompt, negative_prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps, num_images)

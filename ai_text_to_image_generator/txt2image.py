import os
import torch
from gradio_client import Client
from diffusers import StableDiffusion3Pipeline
import shutil
import uuid


def generate_with_diffusers(prompt, negative_prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps):
    pipe = StableDiffusion3Pipeline.from_pretrained(
        "stabilityai/stable-diffusion-3.5-large",
        torch_dtype=torch.bfloat16
    )
    pipe = pipe.to("cuda")

    if not randomize_seed and seed is not None:
        generator = torch.Generator("cuda").manual_seed(seed)
    else:
        generator = None

    image = pipe(
        prompt=prompt,
        negative_prompt=negative_prompt,
        width=width,
        height=height,
        guidance_scale=guidance_scale,
        num_inference_steps=num_inference_steps,
        generator=generator
    ).images[0]

    return image


def generate_images(prompt, negative_prompt, seed, randomize_seed, width, height, guidance_scale, num_inference_steps, num_images):
    output_paths = []

    output_dir = os.path.join('static', 'images')
    os.makedirs(output_dir, exist_ok=True)

    try:
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

    except Exception as e:
        print("Falling back to local Diffusers pipeline...")

        for i in range(num_images):
            current_seed = seed + i if not randomize_seed else None
            image = generate_with_diffusers(
                prompt=prompt,
                negative_prompt=negative_prompt,
                seed=current_seed,
                randomize_seed=randomize_seed,
                width=width,
                height=height,
                guidance_scale=guidance_scale,
                num_inference_steps=num_inference_steps
            )

            output_path = os.path.join(output_dir, f'generated_image_{uuid.uuid4()}.png')
            image.save(output_path)
            output_paths.append(output_path)

    return output_paths


if __name__ == "__main__":
    params = {
        "prompt": "Generate me a image of a black mustang doing drifts",
        "negative_prompt": "",
        "seed": 9424,
        "randomize_seed": True,
        "width": 1024,
        "height": 768,
        "guidance_scale": 4.5,
        "num_inference_steps": 40,
        "num_images": 2
    }

    output_paths = generate_images(**params)
    print("Images saved at:")
    for path in output_paths:
        print(path)

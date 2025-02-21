import json
from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import numpy as np
import base64
from PIL import Image
from pathlib import Path
import io
import uuid
from .models.generate_masks import generate_masks
from .models.apply_removal import apply_removal
from .models.apply_fill import apply_fill
from .models.apply_replace import apply_replace
import shutil

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / 'models'
RESULTS_DIR = MODELS_DIR / 'results'

def inpaint_view(request):
    return render(request, 'inpainting/inpaint.html')

@csrf_exempt
def generate_mask(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            image = data.get('image')
            coords = data.get('coords')
            operation_type = data.get('operation_type', 'fill')  
            
            point_coords = [[coords[0], coords[1]]]
            
            img_data = base64.b64decode(image.split(',')[1])
            img = Image.open(io.BytesIO(img_data)).convert('RGB')
            temp_img_path = RESULTS_DIR / "temp_input.png"
            img.save(temp_img_path)
            
            print("Image mode:", img.mode)
            print("Image size:", img.size)
            print("Point coords:", point_coords)
            
            masks = generate_masks(
                input_img=str(temp_img_path),
                point_coords=point_coords,
                point_labels=[1],
                dilate_kernel_size=15,
                output_dir=str(RESULTS_DIR),
                sam_model_type="vit_h",
                sam_ckpt=str(MODELS_DIR / "pretrained_models/sam_vit_h_4b8939.pth"),
                operation_type=operation_type
            )
            
            buffered = io.BytesIO()
            Image.fromarray(masks).save(buffered, format="PNG")
            mask_str = base64.b64encode(buffered.getvalue()).decode()
            
            return JsonResponse({
                'status': 'success', 
                'mask': f'data:image/png;base64,{mask_str}'
            })
        except Exception as e:
            print(f"Error in generate_mask: {str(e)}")
            return JsonResponse({'status': 'error', 'message': str(e)})

@csrf_exempt
def save_mask(request):
    if request.method == 'POST':
        if RESULTS_DIR.exists():
            for folder in RESULTS_DIR.iterdir():
                if folder.is_dir():
                    shutil.rmtree(folder)
        data = json.loads(request.body)
        mask = data.get('mask')
        
        RESULTS_DIR.mkdir(exist_ok=True)
        session_id = str(uuid.uuid4())
        session_dir = RESULTS_DIR / session_id
        session_dir.mkdir(exist_ok=True)
        
        mask_data = base64.b64decode(mask.split(',')[1])
        mask_path = session_dir / "mask.png"
        with open(mask_path, "wb") as f:
            f.write(mask_data)
            
        return JsonResponse({
            'status': 'success',
            'session_id': session_id
        })


@csrf_exempt
def process_image(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        operation = data.get('operation')
        print(f"Operation received: {operation}")
        image = data.get('image')
        mask = data.get('mask')
        prompt = data.get('prompt')
        session_id = data.get('session_id')
        session_dir = RESULTS_DIR / session_id

        controlnet_scale = float(data.get('controlnet_scale', 0.9))
        guidance_scale = float(data.get('guidance_scale', 3.5))
        inference_steps = int(data.get('inference_steps', 25))
        seed = int(data.get('seed', -1)) if data.get('seed') else None
        negative_prompt = data.get('negative_prompt', '')

        img_data = base64.b64decode(image.split(',')[1])
        img_path = session_dir / "input.png"
        with open(img_path, "wb") as f:
            f.write(img_data)
        
        mask_data = base64.b64decode(mask.split(',')[1])
        mask_img = Image.open(io.BytesIO(mask_data)).convert('L')
        mask_path = session_dir / "mask.png"
        mask_img.save(mask_path)
        
        if operation == 'remove':
            apply_removal(
                input_img=str(session_dir / "input.png"),
                masks_dir=str(session_dir),
                lama_config=str(MODELS_DIR / "lama/configs/prediction/default.yaml"),
                lama_ckpt=str(MODELS_DIR / "pretrained_models/big-lama")
            )
            result = Image.open(session_dir / "inpainted.png")

        if operation in ['fill', 'replace']:
            apply_fill(
                input_img=str(session_dir / "input.png"),
                masks_dir=str(session_dir),
                text_prompt=prompt,
                controlnet_scale=controlnet_scale,
                guidance_scale=guidance_scale,
                num_inference_steps=inference_steps,
                seed=seed,
                negative_prompt=negative_prompt
            )
            result = Image.open(session_dir / "filled_with_mask.png")
            print("Fill operation completed")
            
        buffered = io.BytesIO()
        result.save(buffered, format="PNG")
        img_str = base64.b64encode(buffered.getvalue()).decode()
        
        return JsonResponse({
            'status': 'success',
            'result': f'data:image/png;base64,{img_str}'
        })



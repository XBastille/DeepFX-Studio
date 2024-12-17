from django.shortcuts import render
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import base64
from PIL import Image
import io
import os
from .ml_models.isnet_inference import save_inference
import tempfile

def index(request):
    return render(request, 'remover/index.html')

@csrf_exempt
def remove_background(request):
    if request.method == 'POST':
        image_data = request.POST.get('image')
        
        format, imgstr = image_data.split(';base64,')
        image_data = base64.b64decode(imgstr)
        
        img = Image.open(io.BytesIO(image_data)).convert('RGB')
        
        temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
        img.save(temp_input.name, 'PNG', quality=100)
        temp_input.close()
        
        mask_path, rgba_path = save_inference(temp_input.name)
        
        with open(rgba_path, 'rb') as img_file:
            output_image = base64.b64encode(img_file.read()).decode('utf-8')
        
        os.unlink(temp_input.name)
        os.unlink(mask_path)
        os.unlink(rgba_path)
        
        return JsonResponse({'processed_image': output_image})
    
    return JsonResponse({'error': 'Invalid request method'})

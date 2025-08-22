import os
import io
import base64
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
import tempfile
from PIL import Image
import logging
from .deoldify_models.inference import process_image

logger = logging.getLogger(__name__)

@csrf_exempt
def ai_colorization(request):
    if request.method == "POST":
        try:
            image_file = request.FILES.get('file')
            if not image_file:
                return JsonResponse({'error': 'No image provided'}, status=400)
            
            with tempfile.NamedTemporaryFile(delete=False, suffix='.jpg') as temp_file:
                for chunk in image_file.chunks():
                    temp_file.write(chunk)
                temp_path = temp_file.name
            
            quality_factor = int(request.POST.get('quality', 35))
            artistic = request.POST.get('artistic', 'true').lower() == 'true'
            colorized_path = process_image(
                temp_path, 
                quality_factor=quality_factor,
                watermarked=False,
                artistic=artistic
            )
            
            with open(colorized_path, "rb") as img_file:
                colorized_image_data = base64.b64encode(img_file.read()).decode('utf-8')
            
            with open(temp_path, "rb") as img_file:
                original_image_data = base64.b64encode(img_file.read()).decode('utf-8')
                
            os.remove(temp_path)
            
            return JsonResponse({
                'success': True,
                'original_image': f'data:image/jpeg;base64,{original_image_data}',
                'colorized_image': f'data:image/jpeg;base64,{colorized_image_data}'
            })
            
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return render(request, "pages/ai_colorization.html")

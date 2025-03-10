import os
import shutil
from django.conf import settings
from django.shortcuts import render, redirect
from django.core.files.base import ContentFile
from django.http import JsonResponse
from .models import StyleTransferImage
from .nst_utils import NeuralStyleTransfer
import io
from PIL import Image

def index(request):
    """Home page view."""
    return render(request, 'nst_app/nst.html')

def clean_media_folders():
    """Clean up uploads and results folders to prevent accumulation of files."""
    try:
        uploads_dir = os.path.join(settings.MEDIA_ROOT, 'uploads')
        if os.path.exists(uploads_dir):
            for filename in os.listdir(uploads_dir):
                file_path = os.path.join(uploads_dir, filename)
                if os.path.isfile(file_path):
                    os.unlink(file_path)
        
        results_dir = os.path.join(settings.MEDIA_ROOT, 'results')
        if os.path.exists(results_dir):
            for filename in os.listdir(results_dir):
                file_path = os.path.join(results_dir, filename)
                if os.path.isfile(file_path):
                    os.unlink(file_path)
                    
        StyleTransferImage.objects.all().delete()
    except Exception as e:
        print(f"Error cleaning media folders: {e}")

def process_images(request):
    """Process uploaded images for style transfer."""
    if request.method == 'POST':
        clean_media_folders()
        
        content_image = request.FILES.get('content_image')
        style_image = request.FILES.get('style_image')
        
        if not content_image or not style_image:
            return JsonResponse({'error': 'Please upload both content and style images'}, status=400)
            
        style_transfer = StyleTransferImage(
            content_image=content_image,
            style_image=style_image
        )
        style_transfer.save()
        
        content_path = style_transfer.content_image.path
        style_path = style_transfer.style_image.path
        
        model_path = "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2"
        nst = NeuralStyleTransfer(model_path=model_path)
        
        try:
            stylized_img = nst.stylize_image(content_path, style_path)
            
            img = Image.fromarray((stylized_img * 255).astype('uint8'))
            buffer = io.BytesIO()
            img.save(buffer, format='JPEG')
            
            result_filename = f"result_{style_transfer.id}.jpg"
            style_transfer.result_image.save(result_filename, ContentFile(buffer.getvalue()))
            
            return JsonResponse({
                'success': True,
                'result_url': style_transfer.result_image.url
            })
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    
    return JsonResponse({'error': 'Invalid request method'}, status=405)
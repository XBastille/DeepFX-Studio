import os
import uuid
import base64
from django.conf import settings
from django.shortcuts import render
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.http import JsonResponse
from artistic_image_creator.nst.nst import NeuralStyleTransfer


def index(request):
    """Home page view."""
    return render(request, 'pages/artistic_image_creator.html')

def encoded_image(image_path):
    with open(image_path, "rb") as image_file:
        encoded_string = base64.b64encode(image_file.read())
    return encoded_string.decode('utf-8')    

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

        model_path = "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2"
        nst = NeuralStyleTransfer(model_path=model_path)

        try:
            # Save content and style images temporarily
            content_path = default_storage.save(f"uploads/{uuid.uuid4()}_{content_image.name}", ContentFile(content_image.read()))
            style_path = default_storage.save(f"uploads/{uuid.uuid4()}_{style_image.name}", ContentFile(style_image.read()))
            content_full_path = os.path.join(settings.MEDIA_ROOT, content_path)
            style_full_path = os.path.join(settings.MEDIA_ROOT, style_path)

            result_image_path = nst.stylize_image(content_full_path, style_full_path)

            encoded_img = encoded_image(result_image_path)
            print("Encoded Image: ", encoded_image)

            return (request, "pages/artistic_image_creator.html", {
                'processed_image': encoded_img
            })

        except Exception as e:
            return render(request, "pages/artistic_image_creator.html", {'error': str(e)}, status=500)

    return render(request, "pages/artistic_image_creator.html", {'error': 'Invalid request method'}, status=405)
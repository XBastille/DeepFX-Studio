from django.core.files.storage import FileSystemStorage
from django.shortcuts import render
import re
import time
from background_remover.is_net.isnet_inference import save_inference


def sanitize_filename(filename):
    # Replace any character that is not a letter, digit, or underscore with an underscore
    sanitized = re.sub(r'[^a-zA-Z0-9_.]', '_', filename)
    return sanitized
  
def background_remover(request):
    if request.method == 'POST':
        uploaded_file = request.FILES['file']
        fs = FileSystemStorage() 
        
        original_filename = uploaded_file.name
        file_name_without_extension = original_filename.rsplit('.', 1)[0]
        file_extension = original_filename.rsplit('.', 1)[1]
        timestamp = int(time.time())
        unique_filename = f"{file_name_without_extension}_{timestamp}.{file_extension}"
        unique_filename = sanitize_filename(unique_filename)

        saved_filename = fs.save(unique_filename, uploaded_file)

        absolute_path = fs.path(saved_filename)
        mask_path, rgba_path = save_inference(absolute_path)


        processed_image = f"outputs/{unique_filename.rsplit('.', 1)[0]}_nobg.png"
        print("RGB-Path:", rgba_path, "\nMask-Path: ", mask_path,"\nprocessed_image: ", processed_image)
        return render(request, "pages/background_remover.html", { "processed_image": processed_image })
    elif request.method == 'GET':
        return render(request, "pages/background_remover.html")
    
        
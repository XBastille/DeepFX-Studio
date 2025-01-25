import io
import json
import os
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from PIL import Image
from django.shortcuts import render
from background_remover.is_net.isnet_inference import save_inference
import base64
import tempfile

@csrf_exempt
def background_remover(request):
    if request.method == 'POST':
        try:
            body = json.loads(request.body.decode('utf-8'))
            image_data = body.get("file")

            if not image_data:
                return JsonResponse({
                    "status": "error",
                    "message": "No image data found in the request"
                }, status=400)

            # Decode base64 image data
            image_bytes = base64.b64decode(image_data.split(',')[1])  # Strip "data:image/...;base64,"
            img = Image.open(io.BytesIO(image_bytes)).convert('RGB')

            # Save the image temporarily
            temp_input = tempfile.NamedTemporaryFile(delete=False, suffix='.png')
            img.save(temp_input.name, 'PNG', quality=180)
            temp_input.close()

            mask_path, rgba_path = save_inference(temp_input.name)

            # Encode the output image to base64
            with open(rgba_path, 'rb') as img_file:
                output_image = base64.b64encode(img_file.read()).decode('utf-8')

            # Clean up temporary files
            os.unlink(temp_input.name)
            os.unlink(mask_path)
            os.unlink(rgba_path)

            return render(request, "pages/background_remover.html", {"processed_image": output_image})

            # # Return the success response
            # return JsonResponse({
            #     "status": "success",
            #     "message": "Image processed successfully",
            #     # "orginal_image": image_data,
            #     "processed_image": output_image,
            # })

        except Exception as e:
            # Handle any exceptions and return an error response
            return JsonResponse({
                "status": "error",
                "message": f"An error occurred: {str(e)}"
            }, status=500)
    else:    
        return render(request, "pages/background_remover.html")
    
        
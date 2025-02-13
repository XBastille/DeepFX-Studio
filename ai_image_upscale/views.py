from PIL import Image 
import base64
from django.http import JsonResponse
from django.shortcuts import render
import os
import tempfile
from ai_image_upscale.real_ersgan.inference import process_image

# Create your views here.

def ai_image_upscale(request):
    return render(request, "pages/ai_upscale.html")

def api_ai_image_upscale(request):
    request.session.flush()

    if request.method == "POST":
        try:
            # Ensure 'file' is in the request
            if "file" not in request.FILES:
                return JsonResponse(
                    {"status": "error", "message": "No file uploaded."}, status=400
                )
            # upscale value
            scale_size = request.scale_size

            # output image extension
            saved_ex = request.saved_ex

            # Load the file
            uploaded_file = request.FILES["file"]

            # Process the uploaded file as needed
            img = Image.open(uploaded_file).convert("RGB")

            # Save the image temporarily
            temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            img.save(temp_input.name, "PNG", quality=180)
            temp_input.close()

            # Process the image
            upscale_img_path = process_image(temp_input.name, "output_img", saved_ex, scale_size)

            # Encode the output image to base64
            with open(upscale_img_path, "rb") as img_file:
                output_image = base64.b64encode(img_file.read()).decode("utf-8")

            # Clean up temporary files
            os.unlink(temp_input.name)

            return render(request, "pages/ai_upscale.html", {"processed_image": output_image})

        except Exception as e:
            request.session["error"] = f"An error occurred: {str(e)}"
            return render(request, "pages/ai_upscale.html", {"error": f"An error occurred: {str(e)}"})
    else:
        return render(request, "pages/ai_upscale.html", {"error": "Invalid request method. Use POST."})


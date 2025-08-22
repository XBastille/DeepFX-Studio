import base64
import os
import tempfile

from django.http import JsonResponse
from django.shortcuts import redirect, render, reverse
from PIL import Image

from background_remover.is_net.isnet_inference import save_inference


def index(request):
    return render(request, "pages/background_remover.html")

def process_image(request):
    if request.method == "POST":
        try:
            # Ensure 'file' is in the request
            if "file" not in request.FILES:
                return JsonResponse(
                    {"status": "error", "message": "No file uploaded."}, status=400
                )

            # Load the file
            uploaded_file = request.FILES["file"]

            # Process the uploaded file as needed
            img = Image.open(uploaded_file).convert("RGB")

            # Save the image temporarily
            temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            img.save(temp_input.name, "PNG", quality=180)
            temp_input.close()

            # Process the image
            mask_path, rgba_path = save_inference(temp_input.name)

            # Encode the output image to base64
            with open(rgba_path, "rb") as img_file:
                output_image = base64.b64encode(img_file.read()).decode("utf-8")

            # Clean up temporary files
            os.unlink(temp_input.name)
            os.unlink(mask_path)
            os.unlink(rgba_path)

            return render(
                request,
                "pages/background_remover.html",
                {"processed_image": output_image},
            )

        except Exception as e:
            request.session["error"] = f"An error occurred: {str(e)}"
            return render(
                request,
                "pages/background_remover.html",
                {"error": f"An error occurred: {str(e)}"},
            )
    else:  
        return render(request, "pages/background_remover.html")

        

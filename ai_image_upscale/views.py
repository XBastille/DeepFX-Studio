import base64
import os
import tempfile

from django.http import JsonResponse
from django.shortcuts import render
from PIL import Image

from ai_image_upscale.real_ersgan.inference import process_image
from website.views import image_to_base64

# Create your views here.


def ai_image_upscale(request):

    if request.method == "POST":
        try:
            # Ensure 'file' is in the request
            if "file" not in request.FILES:
                return JsonResponse(
                    {"status": "error", "message": "No file uploaded."}, status=400
                )
            # Upscale value
            scale_size = request.POST["scale_size"]
            # Output image extension
            saved_ex = request.POST["saved_ex"]
            # Load the file
            uploaded_file = request.FILES["file"]

            print(
                f"""
                'scale_size': {scale_size},
                'saved_ex': {saved_ex},
                'uploaded_file': {uploaded_file}
            """
            )

            # Process the uploaded file as needed
            img = Image.open(uploaded_file).convert("RGB")

            # Save the image temporarily
            temp_input = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            img.save(temp_input.name, "PNG", quality=180)
            temp_input.close()

            # Process the image
            upscale_img_path = process_image(
                temp_input.name, "output_img", saved_ex, scale_size
            )
            output_image = image_to_base64(upscale_img_path)

            # Clean up temporary files
            os.unlink(temp_input.name)

            return render(
                request, "pages/ai_upscale.html", {"processed_image": output_image}
            )

        except Exception as e:
            request.session["error"] = f"An error occurred: {str(e)}"
            return render(
                request,
                "pages/ai_upscale.html",
                {"error": f"An error occurred: {str(e)}"},
            )
    else:
        return render(request, "pages/ai_upscale.html")

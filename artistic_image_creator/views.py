import base64
import logging
import os
import tempfile

from django.http import JsonResponse
from django.shortcuts import redirect, render, reverse
from PIL import Image
import numpy as np

from artistic_image_creator.nst.nst import NeuralStyleTransfer

# Set up logging
logger = logging.getLogger(__name__)


def artistic_image_creator(request):
    return render(request, "pages/artistic_image_creator.html")


def api_artistic_image_creator(request):
    if request.method == "POST":
        try:
            # Ensure 'file' is in the request
            if "file" not in request.FILES:
                return JsonResponse(
                    {"status": "error", "message": "No file uploaded."}, status=400
                )

            if "art_file" not in request.FILES:
                return JsonResponse(
                    {"status": "error", "message": "No Art-File uploaded."}, status=400
                )

            # Load the files
            uploaded_file = request.FILES["file"]
            uploaded_art_file = request.FILES["art_file"]

            print(uploaded_art_file, "\n", uploaded_file)
            
            # Process the uploaded files
            img_file = Image.open(uploaded_file).convert("RGB")
            img_art_file = Image.open(uploaded_art_file).convert("RGB")

            # Save the files temporarily
            temp_file_input = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            img_file.save(temp_file_input.name, "PNG")
            temp_file_input.close()

            temp_art_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            img_art_file.save(temp_art_file.name, "PNG")
            temp_art_file.close()

            # Process the image
            model_path = (
                "https://tfhub.dev/google/magenta/arbitrary-image-stylization-v1-256/2"
            )
            nst = NeuralStyleTransfer(model_path=model_path)
            content_image_path = temp_file_input.name
            style_image_path = temp_art_file.name
            processed_img = nst.stylize_image(content_image_path, style_image_path)

            # Ensure the processed image is in the correct format
            processed_img = np.clip(processed_img * 255, 0, 255).astype(np.uint8)  # Convert float32 to uint8

            # Save the processed image to a temporary file
            temp_output_file = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
            Image.fromarray(processed_img).save(temp_output_file.name, "PNG")

            # Encode the processed image to base64
            with open(temp_output_file.name, "rb") as img_file:
                output_image = base64.b64encode(img_file.read()).decode("utf-8")

            # Clean up temporary files
            os.unlink(temp_file_input.name)
            os.unlink(temp_art_file.name)
            os.unlink(temp_output_file.name)

            # Store the processed image in the session
            # request.session["artistic_processed_image"] = output_image
            # return redirect(reverse("artistic-image-creator:artistic_image_creator"))
            return render(request, "pages/artistic_image_creator.html", {"processed_image": output_image})
        except Exception as e:
            logger.error(f"An error occurred: {str(e)}")
            # request.session["artistic_image_error"] = f"An error occurred: {str(e)}"
            # return redirect(reverse("artistic-image-creator:artistic_image_creator"))

            return render(request, "pages/artistic_image_creator.html", {"error": str(e)})
    else:
        # request.session["artistic_image_error"] = "Invalid request method. Use POST."
        # return redirect(reverse("artistic-image-creator:artistic_image_creator"))
        return render(request, "pages/artistic_image_creator.html", {"error": "Invalid request method. Use POST."})


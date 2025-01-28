import base64
import os
# from urllib.parse import urlencode
import tempfile

from django.http import JsonResponse
from django.shortcuts import redirect, render, reverse
from PIL import Image

from background_remover.is_net.isnet_inference import save_inference

# from background_remover.models import ProcessedImage


def background_remover(request):
    return render(request, "pages/background_remover.html")


def api_background_remover(request):
    request.session.flush()

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

            # # Encode the input image to base64
            # with open(temp_input, 'rb') as img_file:
            #     input_image = base64.b64encode(img_file.read()).decode('utf-8')

            # Encode the output image to base64
            with open(rgba_path, "rb") as img_file:
                output_image = base64.b64encode(img_file.read()).decode("utf-8")

            # Clean up temporary files
            os.unlink(temp_input.name)
            os.unlink(mask_path)
            os.unlink(rgba_path)

            # Return the processed image to the front-end
            # return JsonResponse({"processed_image": output_image})
            # query_params = urlencode({"processed_image": output_image})

            # processed_image = ProcessedImage.objects.create(orginal_image_data=input_image,processed_image_data=output_image);
            request.session["processed_image"] = output_image
            return redirect(reverse("background-remover:background_remover"))

            # return render(request, "pages/result_page.html", {"processed_image": output_image})

        except Exception as e:
            request.session["error"] = f"An error occurred: {str(e)}"
            return redirect(reverse("background-remover:background_remover"))

            # return render(request, "pages/result_page.html", {"error": f"An error occurred: {str(e)}"})
            # return JsonResponse({
            #     "status": "error",
            #     "message": f"An error occurred: {str(e)}"
            # }, status=500)
    else:
        request.session["error"] = "Invalid request method. Use POST."
        # error_message = urlencode({"error": "Invalid request method. Use POST."})
        return redirect(reverse("background-remover:background_remover"))

        # return render(request, "pages/background_remover.html", {"error": "Invalid request method. Use POST."})
        # return JsonResponse({
        #     "status": "error",
        #     "message": "Invalid request method. Use POST."
        # }, status=405)

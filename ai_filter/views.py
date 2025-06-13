import os
import uuid
import base64
import logging
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from ai_filter.filters.arcane_inference import execute_transformation
from ai_filter.filters.onnx_inference import execute_inference
from website.views import image_to_base64

# Create your views here.


def ai_filter(request):
    return render(request, "pages/ai_filter.html")


def api_ai_filter(request):
    if request.method == "POST":
        clean_media_folders()

        try:
            if "image_file" not in request.FILES:
                return render(
                    request,
                    "pages/ai_filter.html",
                    {"error": f"No File Uploaded"}
                )
            filter = request.POST.get("filter")
            uploaded_file = request.FILES.get("image_file")
            print(f"""
                'Uploaded File':{uploaded_file},
                'filter': {filter}
            """)

            # save the uploaded file
            image_path = default_storage.save(f"uploads/{uuid.uuid4()}_{uploaded_file.name}", ContentFile(uploaded_file.read()))
            image_path_full = os.path.join(settings.MEDIA_ROOT, image_path)

            if filter != "arcane" :
                model_path=""
                if filter == "hayao":
                    model_path = "ai_filter/filters/pretrained_models/Hayao.onnx"
                elif filter == "paprik":
                    model_path = "ai_filter/filters/pretrained_models/Paprika.onnx"
                elif filter == "portraitsketch":
                    model_path = "ai_filter/filters/pretrained_models/PortraitSketch.onnx"
                elif filter == "jp_face":
                    model_path = "ai_filter/filters/pretrained_models/JP_face.onnx"
                elif filter == "shinkai":
                    model_path = "ai_filter/filters/pretrained_models/Shinkai.onnx"

                output_image = execute_inference(source_path=image_path_full,model_path=model_path)
            else:
                model_path = "ai_filter/filters/pretrained_models/Arcane.Arcane.jit"
                output_image = execute_transformation(input_path=image_path_full, model_path=model_path)

            output_image_base64 = image_to_base64(output_image)
            orginal_image_base64 = image_to_base64(image_path_full)
            return render(
                request,
                "pages/ai_filter.html",
                {
                    "processed_image": output_image_base64,
                    "orginal_image" : orginal_image_base64
                }
            )
        except Exception as e:
            print("Error : ", e)
            return render(
                request,
                "pages/ai_filter.html",
                {"error": f"An error occured: {str(e)}"}
            )
    return  render(request, "pages/ai_filter.html")

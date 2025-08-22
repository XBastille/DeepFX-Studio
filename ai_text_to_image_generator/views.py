import os
import json
from django.core.files import File
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect
from .models import Text2ImageModel, GeneratedImages

from ai_text_to_image_generator.txt2image import generate_images

# Create your views here.


@login_required
def text_to_image(request):
    user_data = Text2ImageModel.objects.filter(user=request.user).prefetch_related("images") # type: ignore

    print("user_data :", user_data)
    return render(request, "pages/text-to-image.html",{"user_data" : user_data})


# @login_required
@csrf_exempt
def api_text_to_image(request):
    if request.method == "POST":
        try:
            data = json.loads(request.body)
            if not data.get("prompt"):
                return JsonResponse({"status": 400, "message": "Prompt is required"})

            params = {
                "prompt": data.get("prompt"),
                "negative_prompt": data.get("negative_prompt", ""),
                "seed": int(data.get("seed", 0)),
                "randomize_seed": data.get("randomize_seed", "true") == "true",
                "width": int(data.get("width", 1024)),
                "height": int(data.get("height", 768)),
                "guidance_scale": float(data.get("guidance_scale", 4.5)),
                "num_inference_steps": int(data.get("num_inference_steps", 40)),
                "num_images": int(data.get("num_images", 1)),
            }

            output_paths = generate_images(**params)

            instance = Text2ImageModel.objects.create( # type: ignore
                user=request.user,
                prompt=params["prompt"],
                negative_prompt=params["negative_prompt"],
                seed=params["seed"],
                randomize_seed=params["randomize_seed"],
                width=params["width"],
                height=params["height"],
                guidance_scale=params["guidance_scale"],
                num_inference_steps=params["num_inference_steps"],
                num_images=params["num_images"],
            )

            for path in output_paths:
                with open(path, 'rb') as f:
                    django_file = File(f)
                    GeneratedImages.objects.create( # type: ignore
                       text2image = instance,
                       image = django_file
                    )

            return JsonResponse({"status": 200, "images": output_paths})
        except Exception as e:
            return render(request, "pages/text-to-image.html", { "error": str(e) })

    return redirect("ai_text_to_image")

from django.urls import path

from . import views

app_name = "ai-image-upscale"

urlpatterns = [
    path("", views.ai_image_upscale, name="ai_image_upscale"),
    path(
        "generate/", views.api_ai_image_upscale, name="ai_image_upscale_api"
    ),
]

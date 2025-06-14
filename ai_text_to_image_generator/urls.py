from django.urls import path

from . import views

app_name = "ai-text-to-image"

urlpatterns = [
    path("", views.text_to_image, name="ai_text_to_image"),
    path("generate/", views.api_text_to_image, name="ai_text_to_image_api"),
]

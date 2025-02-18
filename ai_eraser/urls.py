from django.urls import path

from . import views

app_name = "ai-eraser"

urlpatterns = [
    path("", views.ai_eraser, name="ai_eraser"),
    path("generate/", views.api_ai_eraser, name="ai_eraser_api"),
]

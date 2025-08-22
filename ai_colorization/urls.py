from django.urls import path

from . import views

app_name = "ai-colorization"

urlpatterns = [
    path("", views.ai_colorization, name="ai_colorization"),
]

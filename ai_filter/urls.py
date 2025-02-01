from django.urls import path

from . import views

app_name = "ai-filter"

urlpatterns = [
    path("", views.ai_filter, name="ai_filter"),
    path(
        "generate/", views.api_ai_filter, name="ai_filter_api"
    ),
]

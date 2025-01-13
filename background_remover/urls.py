from django.urls import path
from . import views

app_name = "background-remover"

urlpatterns = [
    path("", views.background_remover, name="background_remover_view"),
]

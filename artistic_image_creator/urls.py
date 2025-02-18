from django.urls import path

from . import views

app_name = "artistic-image-creator"

urlpatterns = [path("", views.artistic_image_creator, name="artistic_image_creator")]

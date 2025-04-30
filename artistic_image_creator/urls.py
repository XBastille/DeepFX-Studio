from django.urls import path

from . import views

app_name = "artistic-image-creator"

urlpatterns = [
    path('', views.index, name='nst'),
    path('process/', views.process_images, name='process_images'),
]
from django.urls import path

from . import views

app_name = "background-remover"

urlpatterns = [
    path("", views.index, name="background_remover"),
    path('process/', views.process_image, name='process'),
]

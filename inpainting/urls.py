from django.urls import path
from . import views

app_name = "inpainting"

urlpatterns = [
    path('', views.inpaint_view, name='inpaint'),
    path('api/generate-mask/', views.generate_mask, name='generate_mask'),
    path('api/save-mask/', views.save_mask, name='save_mask'),
    path('api/process-image/', views.process_image, name='process_image'),
]

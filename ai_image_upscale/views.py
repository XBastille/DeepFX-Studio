from django.http import JsonResponse
from django.shortcuts import render

# Create your views here.

def ai_image_upscale(request):
    return render(request, "pages/ai_upscale.html")

def api_ai_image_upscale(request):
    return JsonResponse({"status": "200"})

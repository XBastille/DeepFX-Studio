from django.http import JsonResponse
from django.shortcuts import render

# Create your views here.

def text_to_image(request):
    return render(request, "pages/text-to-image.html")

def api_text_to_image(request):
    return JsonResponse({"status": "200"})

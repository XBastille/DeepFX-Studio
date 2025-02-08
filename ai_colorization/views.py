from django.http import JsonResponse
from django.shortcuts import render

# Create your views here.

def ai_colorization(request):
    return render(request, "pages/ai_colorization.html")

def api_ai_colorization(request):
    return JsonResponse({"status": "200"})

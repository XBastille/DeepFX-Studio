from django.http import JsonResponse
from django.shortcuts import render

# Create your views here.


def ai_eraser(request):
    return render(request, "pages/ai_eraser.html")


def api_ai_eraser(request):
    return JsonResponse({"status": "200"})

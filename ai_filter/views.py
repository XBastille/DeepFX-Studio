from django.http import JsonResponse
from django.shortcuts import render

# Create your views here.


def ai_filter(request):
    return render(request, "pages/ai_filter.html")


def api_ai_filter(request):
    return JsonResponse({"status": "200"})

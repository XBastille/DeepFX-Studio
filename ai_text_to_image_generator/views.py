from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render

# Create your views here.


@login_required
def text_to_image(request):
    return render(request, "pages/text-to-image.html")


@login_required
def api_text_to_image(request):
    return JsonResponse({"status": "200"})

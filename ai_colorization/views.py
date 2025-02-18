from django.http import JsonResponse
from django.shortcuts import render

from artistic_image_creator.views import logger

# Create your views here.


def ai_colorization(request):
    if request.method == "POST":
        try:
            pass
        except Exception as e:
            logger.error(f"An error occured: {str(e)}")
            return render(request, "pages/ai_colorization.html", {"error": str(e)})
    else:
        return render(request, "pages/ai_colorization.html")

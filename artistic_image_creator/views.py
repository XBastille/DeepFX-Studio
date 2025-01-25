from django.shortcuts import render
from django.shortcuts import render


# Create your views here.

def artistic_image_creator(request):
    return render(request, "pages/artistic_image_creator.html")
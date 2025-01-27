from django.contrib.auth.decorators import login_required
from django.shortcuts import render

# Create your views here.


@login_required
def dashboard_view(request):
    request.session.flush()
    return render(request, "pages/dashboard.html")


# this will contain URL to redirect different pages
"""
    - /background-remover/ : Background Remover Page

    - /style-generator/: Style Generator Page using nst model

    - /cartoonize/: this page will list all the styles avilable
    - /cartoonize/arcane-style: Arcane-like images
    - /cartoonize/shinkai-style: Shinkai-like images
    - /cartoonize/portrait-sketch: Portrait sketches-like images
    - /cartoonize/japanese-face: Japanese face-like images
    - /cartoonize/paprika-style: Paprika-like art style images
    - /cartoonize/hayao-style: Hayao-like art style images

    - /deoldify: this will add colors to black and white images

    - /save: this route will save specific data asked by the uses who are logined only
    - /my-creations: this page will list all the creations which i have saves

"""

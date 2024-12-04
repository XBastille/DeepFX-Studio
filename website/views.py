from django.shortcuts import render

# Create your views here.


def index_view(request):
    return render(request, "pages/landing.html")


def about_view(request):
    return render(request, "pages/about.html")


def service_view(request):
    return render(request, "pages/service.html")


def privacy_view(request):
    return render(request, "pages/privacy.html")


def terms_view(request):
    return render(request, "pages/terms_and_conditions.html")

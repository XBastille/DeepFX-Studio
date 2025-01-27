from django.shortcuts import redirect, render, reverse

# Create your views here.


def index_view(request):
    request.session.flush()
    return render(request, "pages/landing.html")


def about_view(request):
    request.session.flush()
    return render(request, "pages/about.html")


def service_view(request):
    request.session.flush()
    return render(request, "pages/service.html")


def privacy_view(request):
    request.session.flush()
    return render(request, "pages/privacy.html")


def terms_view(request):
    request.session.flush()
    return render(request, "pages/terms_and_conditions.html")


def clear_session(request):
    request.session.flush()
    referer_url = request.META.get("HTTP_REFERER", "/")
    return redirect(referer_url)

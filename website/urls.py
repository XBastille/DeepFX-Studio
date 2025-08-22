from django.urls import path

from . import views

app_name = "website"

urlpatterns = [
    path("", views.index_view, name="index_view"),
    path("service/", views.service_view, name="service_view"),
    path("about/", views.about_view, name="about_view"),
    path("privacy/", views.privacy_view, name="privacy_view"),
    path("terms/", views.terms_view, name="terms_view"),
    path("clear-session/", views.clear_session, name="clear_session"),
]

from django.urls import path
from . import views

app_name = "app"

urlpatterns = [
    path("", views.index_view, name="index_view"),
    path("signin/", views.signin, name="signin"),
    path("signup/", views.signup, name="signup"),
    path("signout/", views.signout, name="signout"),
    path("service/", views.service_view, name="service_view"),
    path("about/", views.about_view, name="about_view"),
    path("privacy/", views.privacy_view, name="privacy_view"),
    path("terms-and-conditions/", views.terms_view, name="terms-and-conditions_view"),
    path("dashboard/", views.dashboard_view, name="dashboard_view"),
]

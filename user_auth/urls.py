from django.urls import path

from . import views

app_name = "user_auth"

urlpatterns = [
    path("signin/", views.signin_view, name="signin_view"),
    path("signup/", views.signup_view, name="signup_view"),
    path("signout/", views.signout, name="signout"),
    path("forgot_password/", views.forgot_password_view, name="forgot_password_view"),
]

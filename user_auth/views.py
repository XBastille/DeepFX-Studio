from django.contrib.auth import authenticate, get_backends, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.shortcuts import HttpResponseRedirect, redirect, render
from django.urls import reverse
import urllib.parse

# Create your views here.


def forgot_password_view(request):
    return render(request, "pages/forgot_password.html")


def signup_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        email = request.POST.get("email")
        password = request.POST.get("password")
        repeat_password = request.POST.get("confirm-password")

        # Ensure passwords match
        if password != repeat_password:
            error_message = "The passwords entered do not match. Please try again."
            base_url = reverse("account_signup") 
            query = urllib.parse.urlencode({"error_message": error_message})
            url = f"{base_url}?{query}"
            return redirect(url)

        try:
            # Create the new user
            newUser = User.objects.create_user(
                username=username, email=email, password=password
            )
            newUser.save()

            # Log in the user using the first backend (if multiple exist)
            backend = get_backends()[0]
            newUser.backend = f"{backend.__module__}.{backend.__class__.__name__}"
            login(request, newUser, backend=newUser.backend)

            return redirect(reverse("dashboard:dashboard_view"))
        except IntegrityError:
            error_message = "Invalid credentials"
            base_url = reverse("account_signup") 
            query = urllib.parse.urlencode({"error_message": error_message})
            url = f"{base_url}?{query}"
            return redirect(url)
    else:
        return render(request, "pages/signup.html")


def signin_view(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")

        # Authenticate the user
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect(reverse("dashboard:dashboard_view"))
        else:
            error_message = "Invalid credentials."
            base_url = reverse("account_login") 
            query = urllib.parse.urlencode({"error_message": error_message})
            url = f"{base_url}?{query}"
            return redirect(url)
    else:
        return render(request, "pages/signin.html")


def signout(request):
    logout(request)
    return redirect("website:index_view")

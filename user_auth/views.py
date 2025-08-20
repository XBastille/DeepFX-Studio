from django.contrib.auth import authenticate, get_backends, login, logout
from django.contrib.auth.models import User
from django.db import IntegrityError
from django.shortcuts import HttpResponseRedirect, redirect, render
from django.urls import reverse

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
            return render(
                request,
                "pages/signup.html",
                {
                    "error_message": "The passwords entered do not match. Please try again."
                },
            )

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
            return render(
                request,
                "pages/signup.html",
                {
                    "error_message": "This username or email is already in use. Please choose a different one."
                },
            )
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
            error_message= "Invalid credentials"
            return redirect(reverse("account_login", query={"error_message": error_message}))
    else:
        return render(request, "pages/signin.html")
        

def signout(request):
    logout(request)
    return redirect("website:index_view")

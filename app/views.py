from django.shortcuts import HttpResponseRedirect, render, redirect
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.contrib.auth.models import User

# Create your views here.
def index_view(request):
    return render(request, 'app/index.html')


def about_view(request):
    return render(request, 'app/about.html')


def service_view(request):
    return render(request, 'app/service.html')


def privacy_view(request):
    return render(request, 'app/privacy.html')


def terms_view(request):
    return render(request, 'app/terms-and-conditions.html')


@login_required(login_url='app:signin')
def dashboard_view(request):
    return render(request, 'app/dashboard.html')


def signup(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches with confirmation
        password = request.POST["password"]
        repeat_password = request.POST["confirm-password"]

        if password != repeat_password:
            return render(request, 'app/signup.html', {"error_message": "Passwords do not match"})
        else:
            try:
                newUser = User.objects.create_user(
                    password=password, username=username, email=email
                )
                newUser.save()
                login(request, newUser)
                return redirect(reverse('app:dashboard_view'))
            except IntegrityError:
                return render(request, 'app/signup.html', {"error_message": "Username/Email already taken"})
    else:
        return render(request, 'app/signup.html')


def signin(request):
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']

        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return redirect(reverse('app:dashboard_view'))

        else:
            return render(request, 'app/signin.html', {"error_message": "Invalid Credentials"})
    else:
        return render(request, 'app/signin.html', {"error_message": "Invalid Credentials"})


def signout(request):
    logout(request)
    return render(request, 'app/index.html')

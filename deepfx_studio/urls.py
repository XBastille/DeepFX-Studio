"""
URL configuration for deepfx_studio project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("", include("website.urls")),
    path("", include("dashboard.urls")),
    path("", include("user_auth.urls")),
    path("", include("django_components.urls")),
    path("background-remover/",include("background_remover.urls")), # background-remover
    path("accounts/", include("allauth.urls")),  # all OAuth operations will be performed under this route
    path("__reload__/", include("django_browser_reload.urls")),
]

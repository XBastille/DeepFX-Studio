from django.contrib.auth.decorators import login_required
from django.shortcuts import render

# Create your views here.


@login_required
def dashboard_view(request):
    return render(request, "pages/dashboard.html")

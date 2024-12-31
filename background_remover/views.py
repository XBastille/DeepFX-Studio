from django.contrib.auth.decorators import login_required
from django.shortcuts import render

# Create your views here.


@login_required
def background_remover_view(request):
    return render(request, "pages/background_remover.html")
 
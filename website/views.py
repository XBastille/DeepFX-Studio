import base64

from django.shortcuts import redirect, render

# Create your views here.

# Make changes into the session_keys what i thought is to remove the
# required session by passing it into a array in session_keys

total_session_keys = [
    "background_remover_processed_image",
    "background_remover_error",
    "artistic_processed_image",
    "artistic_image_error",
    "upscale_processed_image",
    "upscale_image_error",
    "filter_processed_image",
    "filter_image_error",
    "ai_eraser_processed_image",
    "ai_eraser_image_error",
]

# this function is responsible for erasing session data
# of the processed image and response error


def flush_image_data(request, session_keys=[]):
    if session_keys == []:
        for key in total_session_keys:
            request.session.pop(key, None)
    else:
        for key in session_keys:
            request.session.pop(key, None)


def image_to_base64(image_path):
    try:
        with open(image_path, "rb") as image_file:
            encoded_string = base64.b64encode(image_file.read()).decode("utf-8")
            return encoded_string
    except FileNotFoundError:
        return f"Error: File not found at {image_path}"
    except Exception as e:
        return f"An error occurred: {e}"


def index_view(request):
    flush_image_data(request)
    return render(request, "pages/landing.html")


def about_view(request):
    flush_image_data(request)
    return render(request, "pages/about.html")


def service_view(request):
    flush_image_data(request)
    return render(request, "pages/service.html")


def privacy_view(request):
    flush_image_data(request)
    return render(request, "pages/privacy.html")


def terms_view(request):
    flush_image_data(request)
    return render(request, "pages/terms_and_conditions.html")


def clear_session(request):
    flush_image_data(request)

    referer_url = request.META.get("HTTP_REFERER", "/")
    return redirect(referer_url)

from django.db import models
from django.contrib.auth.models import User

# Create your models here.

class Text2ImageModel(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    prompt = models.TextField()
    negative_prompt = models.TextField()
    seed = models.IntegerField(default=0) # type: ignore
    randomize_seed = models.BooleanField(default=True) # type: ignore
    width = models.IntegerField(default=1024) # type: ignore
    height = models.IntegerField(default=768) # type: ignore
    guidance_scale = models.FloatField()
    num_inference_steps = models.IntegerField(default=40) # type: ignore
    num_images = models.IntegerField(default=1) # type: ignore

    class Meta:
        db_table = "text2image_requests"
        verbose_name = "Text-to-Image Request"
        verbose_name_plural = "Text-to-Image Requests"

    def __str__(self):
        return f"Text2Image Request: {self.prompt[:30]}..." # type: ignore


class GeneratedImages(models.Model):
    text2image = models.ForeignKey(Text2ImageModel, on_delete=models.CASCADE, related_name="images")
    image = models.ImageField(upload_to="text2image/")
    create_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Image for {self.text2image.id}" # type: ignore

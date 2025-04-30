from django.db import models

class StyleTransferImage(models.Model):
    content_image = models.ImageField(upload_to='uploads/')
    style_image = models.ImageField(upload_to='uploads/')
    result_image = models.ImageField(upload_to='results/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Style Transfer {self.id}"
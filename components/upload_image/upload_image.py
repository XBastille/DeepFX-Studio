from django_components import Component, register, types


@register("upload_image")
class UploadImage(Component):
    template_name = "upload_image.html"

    # def get_context_data(self, title, content):
    #     return {
    #         "title": title,
    #         "content": content,
    #     }

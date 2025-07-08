from django_components import Component, register, types


@register("compare_image_slider")
class CompareImageSlider(Component):
    template_name = "compare_image_slider.html"

    # def get_context_data(self, title, content):
    #     return {
    #         "title": title,
    #         "content": content,
    #     }

from django_components import Component, register, types


@register("toast")
class Calendar(Component):
    template_name = "template.html"

    def get_context_data(self, title, content):
        return {
            "title": title,
            "content": content,
        }

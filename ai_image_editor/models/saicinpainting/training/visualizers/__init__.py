import logging

from ai_image_editor.models.saicinpainting.training.visualizers.directory import (
    DirectoryVisualizer,
)
from ai_image_editor.models.saicinpainting.training.visualizers.noop import (
    NoopVisualizer,
)


def make_visualizer(kind, **kwargs):
    logging.info(f"Make visualizer {kind}")

    if kind == "directory":
        return DirectoryVisualizer(**kwargs)
    if kind == "noop":
        return NoopVisualizer()

    raise ValueError(f"Unknown visualizer kind {kind}")

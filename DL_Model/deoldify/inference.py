from deoldify import device
from deoldify.device_id import DeviceId

device.set(device=DeviceId.GPU0)

import os
import warnings

import torch
from deoldify.visualize import *

warnings.filterwarnings(
    "ignore", category=UserWarning, message=".*?Your .*? set is empty.*?"
)


def check_folder(path):
    if not os.path.exists(path):
        os.makedirs(path)
    return path


def get_unique_output_path(input_path, output_dir, artistic=True):
    input_filename = os.path.splitext(os.path.basename(input_path))[0]
    model_type = "artistic" if artistic else "stable"
    output_subdir = os.path.join(output_dir, model_type)
    check_folder(output_subdir)

    base_path = os.path.join(output_subdir, f"{input_filename}.jpg")
    if not os.path.exists(base_path):
        return base_path

    counter = 1
    while os.path.exists(
        os.path.join(output_subdir, f"{input_filename}_{counter}.jpg")
    ):
        counter += 1
    return os.path.join(output_subdir, f"{input_filename}_{counter}.jpg")


def process_image(input_path, render_factor=35, watermarked=True, artistic=True):
    """if not torch.cuda.is_available():
    print('GPU not available.')
    return None"""

    colorizer = get_image_colorizer(artistic=artistic)
    output_path = get_unique_output_path(input_path, "outputs", artistic)

    result = colorizer.plot_transformed_image(
        path=input_path,
        render_factor=render_factor,
        compare=False,
        watermarked=watermarked,
    )

    if os.path.exists(result):
        os.rename(result, output_path)

    return output_path


if __name__ == "__main__":
    input_image = "inputs/your_image"
    render_factor = 35
    watermarked = True
    artistic = False
    output_path = process_image(input_image, render_factor, watermarked, artistic)
    if output_path:
        print(f"Image saved to: {output_path}")

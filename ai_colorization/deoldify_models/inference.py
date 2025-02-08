import os
from deoldify._device import ComputeManager
from deoldify.device_id import DeviceId
compute_device = ComputeManager()
compute_device.configure(device=DeviceId.GPU0)

from deoldify.visualize import create_artistic_colorizer, create_stable_colorizer

import warnings
warnings.filterwarnings("ignore", category=UserWarning, message=".*?Your .*? set is empty.*?")

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
    while os.path.exists(os.path.join(output_subdir, f"{input_filename}_{counter}.jpg")):
        counter += 1
    return os.path.join(output_subdir, f"{input_filename}_{counter}.jpg")

def process_image(input_path, quality_factor=35, watermarked=True, artistic=True):
    enhancer = create_artistic_colorizer(artistic=artistic)
    output_path = get_unique_output_path(input_path, "outputs", artistic)

    result = enhancer.enhance_image(
        path=input_path, 
        quality_factor=quality_factor, 
        compare=False, 
        watermarked=watermarked
    )

    if os.path.exists(result):
        os.rename(result, output_path)

    return output_path

if __name__ == "__main__":
    input_image = "inputs/your_image"
    render_factor = 35
    watermarked = True
    artistic = False
    if output_path := process_image(
        input_image, render_factor, watermarked, artistic
    ):
        print(f"Image saved to: {output_path}")

import warnings
from ai_colorization.deoldify_models.deoldify.visualize import create_artistic_colorizer, create_stable_colorizer
import collections
import collections.abc
for type_name in collections.abc.__all__:
    if not hasattr(collections, type_name):
        setattr(collections, type_name, getattr(collections.abc, type_name))

import torch
import os
# from torch import serialization
from pathlib import Path
from ai_colorization.deoldify_models.deoldify._device import ComputeManager
from ai_colorization.deoldify_models.deoldify.device_id import DeviceId

# serialization.add_safe_globals([slice])

original_torch_load = torch.load

def safe_model_load(path, **kwargs):
    """Safely load PyTorch models trained with older PyTorch versions"""
    if not torch.cuda.is_available() and 'map_location' not in kwargs:
        kwargs['map_location'] = torch.device('cpu')
    
    if 'weights_only' not in kwargs:
        return original_torch_load(path, weights_only=False, **kwargs)
    else:
        return original_torch_load(path, **kwargs)

torch.load = safe_model_load


original_configure = ComputeManager.configure

def patched_configure(self, hardware_unit: DeviceId):
    cuda_available = torch.cuda.is_available()
    
    if not cuda_available:
        hardware_unit = DeviceId.CPU
        print("CUDA not available, forcing CPU mode")
    
    if hardware_unit == DeviceId.CPU:
        os.environ["CUDA_VISIBLE_DEVICES"] = ""
    else:
        try:
            os.environ["CUDA_VISIBLE_DEVICES"] = str(hardware_unit.value)
            torch.backends.cudnn.benchmark = False
        except Exception as e:
            print(f"Error setting up CUDA: {e}")
            hardware_unit = DeviceId.CPU
            os.environ["CUDA_VISIBLE_DEVICES"] = ""

    self._active_compute_unit = hardware_unit
    return hardware_unit

ComputeManager.configure = patched_configure

compute_device = ComputeManager()
if torch.cuda.is_available():
    compute_device.configure(DeviceId.GPU0)
else:
    compute_device.configure(DeviceId.CPU)
    print("Running in CPU mode - colorization will be slower")

warnings.filterwarnings(
    "ignore", category=UserWarning, message=".*?Your .*? set is empty.*?"
)

CURRENT_DIR = Path(__file__).parent.absolute()
MODELS_DIR = CURRENT_DIR / "models"


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


def process_image(input_path, quality_factor=35, watermarked=True, artistic=True):
    if not MODELS_DIR.exists():
        raise FileNotFoundError(f"Models directory not found: {MODELS_DIR}")

    model_name = "ColorizeArtistic_gen.pth" if artistic else "ColorizeStable_gen.pth"
    model_path = MODELS_DIR / model_name

    if not model_path.exists():
        raise FileNotFoundError(f"Model file not found: {model_path}")

    print(f"Using model directory: {MODELS_DIR}")
    print(f"Using model file: {model_path}")

    if artistic:
        enhancer = create_artistic_colorizer(
            root_folder=MODELS_DIR.parent,  
            weights_name="ColorizeArtistic_gen",
            quality_factor=quality_factor,
        )
    else:
        enhancer = create_stable_colorizer(
            root_folder=MODELS_DIR.parent,  
            weights_name="ColorizeStable_gen",
            quality_factor=quality_factor,
        )

    output_dir = CURRENT_DIR / "outputs"
    check_folder(output_dir)
    output_path = get_unique_output_path(input_path, output_dir, artistic)

    result = enhancer.bnw_img(
        path=input_path,
        quality_factor=quality_factor,
        compare=False,
        post_process=not watermarked,
    )

    if os.path.exists(result):
        os.rename(result, output_path)

    return output_path

if __name__ == "__main__":
    input_image = "inputs/your_image"
    render_factor = 35
    watermarked = True
    artistic = False
    if output_path := process_image(input_image, render_factor, watermarked, artistic):
        print(f"Image saved to: {output_path}")
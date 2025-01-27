import os
import os.path
import warnings

import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn.functional as F
from PIL import Image
from torch.autograd import Variable
from torchvision import transforms
from torchvision.transforms.functional import normalize

from background_remover.is_net.data_loader_cache import img_preprocess, img_reader
from background_remover.is_net.models import *
from deepfx_studio.settings import BASE_DIR

warnings.filterwarnings("ignore")

device = "cuda" if torch.cuda.is_available() else "cpu"


class GOSNormalize(object):
    """
    Normalizes the image using mean and standard deviation.

    Arguments:
    mean -- list of three floats, the mean values for each channel (default: [0.485, 0.456, 0.406])
    std -- list of three floats, the standard deviation values for each channel (default: [0.229, 0.224, 0.225])

    Returns:
    A callable object that takes an image tensor as input and normalizes it.
    """

    def __init__(self, mean=None, std=None):
        if mean is None:
            mean = [0.485, 0.456, 0.406]
        if std is None:
            std = [0.229, 0.224, 0.225]
        self.mean = mean
        self.std = std

    def __call__(self, image):
        image = normalize(image, self.mean, self.std)
        return image


transform = transforms.Compose([GOSNormalize([0.5, 0.5, 0.5], [1.0, 1.0, 1.0])])


def load_image(img_path, hypar):
    img = img_reader(img_path)
    img, img_shp = img_preprocess(img, hypar["cache_size"])
    img = torch.divide(img, 255.0)
    shape = torch.from_numpy(np.array(img_shp))
    return transform(img).unsqueeze(0), shape.unsqueeze(0)


def build_model(hypar, device):
    net = hypar["model"]

    if hypar["model_digit"] == "half":
        net.half()
        for layer in net.modules():
            if isinstance(layer, torch.nn.DataParallel.reset.BatchNorm2d):
                layer.float()

    net.to(device)

    if hypar["restore_model"] != "":
        net.load_state_dict(
            torch.load(
                hypar["model_path"] + "/" + hypar["restore_model"], map_location=device
            )
        )
        net.to(device)
    net.eval()
    return net


def predict(net, inputs_val, shapes_val, hypar, device):
    """
    Predicts the mask for the given input image.

    Arguments:
    net -- the neural network model used for prediction
    inputs_val -- tensor of input images (shape: (1, C, H, W))
    shapes_val -- tensor containing the original shape of the image
    hypar -- dictionary of hyperparameters
    device -- the device on which to perform the computations ('cuda' or 'cpu')

    Returns:
    pred_val -- numpy array of shape (H, W) representing the predicted mask, scaled to the range [0, 255]
    """
    net.eval()

    if hypar["model_digit"] == "full":
        inputs_val = inputs_val.type(torch.FloatTensor)
    else:
        inputs_val = inputs_val.type(torch.HalfTensor)

    inputs_val_v = Variable(inputs_val, requires_grad=False).to(device)

    ds_val = net(inputs_val_v)[0]

    pred_val = ds_val[0][0, :, :, :]
    pred_val = torch.squeeze(
        F.upsample(
            torch.unsqueeze(pred_val, 0),
            (shapes_val[0][0], shapes_val[0][1]),
            mode="bilinear",
        )
    )

    ma = torch.max(pred_val)
    mi = torch.min(pred_val)
    pred_val = (pred_val - mi) / (ma - mi)

    if device == "cuda":
        torch.cuda.empty_cache()
    return (pred_val.detach().cpu().numpy() * 255).astype(np.uint8)


hypar = {
    "model_path": "./background_remover/is_net/saved_models",
    "restore_model": "isnet.pth",
    "interm_sup": False,
    "model_digit": "full",
    "seed": 0,
    "cache_size": [1024, 1024],
    "input_size": [1024, 1024],
    "crop_size": [1024, 1024],
    "model": ISNetDIS(),
}

net = build_model(hypar, device)


def save_inference(
    input_image_path, output_dir=os.path.join(BASE_DIR, "static/outputs")
):
    os.makedirs(output_dir, exist_ok=True)

    base_name = os.path.splitext(os.path.basename(input_image_path))[0]

    image_tensor, orig_size = load_image(input_image_path, hypar)
    mask = predict(net, image_tensor, orig_size, hypar, device)

    pil_mask = Image.fromarray(mask).convert("L")

    im_rgb = Image.open(input_image_path).convert("RGB")
    im_rgba = im_rgb.copy()
    im_rgba.putalpha(pil_mask)

    mask_path = os.path.join(output_dir, f"{base_name}_mask.png")
    rgba_path = os.path.join(output_dir, f"{base_name}_nobg.png")

    pil_mask.save(mask_path)
    im_rgba.save(rgba_path, "PNG")

    return mask_path, rgba_path

import numpy as np
import torch
import torch.nn.functional as F
from skimage import io


def img_reader(img_path):
    return io.imread(img_path)


def img_preprocess(img, size):
    if len(img.shape) < 3:
        img = img[:, :, np.newaxis]
    if img.shape[2] == 1:
        img = np.repeat(img, 3, axis=2)
    img_tensor = torch.tensor(img.copy(), dtype=torch.float32)
    img_tensor = torch.transpose(torch.transpose(img_tensor, 1, 2), 0, 1)
    if len(size) < 2:
        return img_tensor, img.shape[:2]
    img_tensor = torch.unsqueeze(img_tensor, 0)
    img_tensor = F.upsample(img_tensor, size, mode="bilinear")
    img_tensor = torch.squeeze(img_tensor, 0)

    return img_tensor.type(torch.uint8), img.shape[:2]

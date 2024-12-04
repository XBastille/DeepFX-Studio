import math
import os

import cv2
import numpy as np
import torch
from basicsr.utils.download_util import load_file_from_url
from torch.nn import functional as F

ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


class RealESRGANer:
    """
    Implements Real-ESRGAN super-resolution model functionality

    Arguments:
    scale -- integer defining the upscaling factor
    model_path -- string path to the model weights file
    dni_weight -- optional weights for deep network interpolation
    model -- the neural network model to be used
    tile -- integer size of tiles for processing large images
    tile_pad -- integer padding size for tiles
    pre_pad -- integer padding size for preprocessing
    half -- boolean to enable half-precision computation
    device -- torch device to run computations on
    gpu_id -- optional specific GPU device ID to use
    """

    def __init__(
        self,
        scale,
        model_path,
        dni_weight=None,
        model=None,
        tile=0,
        tile_pad=10,
        pre_pad=10,
        half=False,
        device=None,
        gpu_id=None,
    ):
        self.scale = scale
        self.tile_size = tile
        self.tile_pad = tile_pad
        self.pre_pad = pre_pad
        self.mod_scale = None
        self.half = half
        if gpu_id:
            self.device = (
                torch.device(f"cuda:{gpu_id}" if torch.cuda.is_available() else "cpu")
                if device is None
                else device
            )
        else:
            self.device = (
                torch.device("cuda" if torch.cuda.is_available() else "cpu")
                if device is None
                else device
            )

        if isinstance(model_path, list):
            assert len(model_path) == len(
                dni_weight
            ), "model_path and dni_weight should have the save length."
            loadnet = self.dni(model_path[0], model_path[1], dni_weight)
        else:
            if model_path.startswith("https://"):
                model_path = load_file_from_url(
                    url=model_path,
                    model_dir=os.path.join(ROOT_DIR, "weights"),
                    progress=True,
                    file_name=None,
                )
            loadnet = torch.load(model_path, map_location=torch.device("cpu"))
        keyname = "params_ema" if "params_ema" in loadnet else "params"
        # model.load_state_dict(loadnet[keyname], strict=True)

        model.eval()
        self.model = model.to(self.device)
        if self.half:
            self.model = self.model.half()

    def dni(self, net_a, net_b, dni_weight, key="params", loc="cpu"):
        """
        Performs Deep Network Interpolation between two models

        Arguments:
        net_a -- path to first model weights
        net_b -- path to second model weights
        dni_weight -- interpolation weights for combining models
        key -- dictionary key for accessing model parameters
        loc -- device location to load models to

        Returns:
        net_a -- interpolated model weights dictionary
        """
        net_a = torch.load(net_a, map_location=torch.device(loc))
        net_b = torch.load(net_b, map_location=torch.device(loc))
        for k, v_a in net_a[key].items():
            net_a[key][k] = dni_weight[0] * v_a + dni_weight[1] * net_b[key][k]
        return net_a

    def pre_process(self, img):
        """
        Prepares input image for model processing

        Arguments:
        img -- input image array to be preprocessed

        Effects:
        - Converts image to torch tensor
        - Applies padding if needed
        - Handles modulo padding for scale factor
        - Stores processed image in self.img
        """
        img = torch.from_numpy(np.transpose(img, (2, 0, 1))).float()
        self.img = img.unsqueeze(0).to(self.device)
        if self.half:
            self.img = self.img.half()
        if self.pre_pad != 0:
            self.img = F.pad(self.img, (0, self.pre_pad, 0, self.pre_pad), "reflect")
        if self.scale == 2:
            self.mod_scale = 2
        elif self.scale == 1:
            self.mod_scale = 4
        if self.mod_scale is not None:
            self.mod_pad_h, self.mod_pad_w = 0, 0
            _, _, h, w = self.img.size()
            if h % self.mod_scale != 0:
                self.mod_pad_h = self.mod_scale - h % self.mod_scale
            if w % self.mod_scale != 0:
                self.mod_pad_w = self.mod_scale - w % self.mod_scale
            self.img = F.pad(
                self.img, (0, self.mod_pad_w, 0, self.mod_pad_h), "reflect"
            )

    def process(self):
        self.output = self.model(self.img)

    def tile_process(self):
        """
        Processes large images in tiles to manage memory

        Effects:
        - Splits input image into tiles
        - Processes each tile through the model
        - Reconstructs full output from processed tiles
        - Stores result in self.output

        The method handles overlapping tiles with padding to avoid boundary artifacts
        """
        batch, channel, height, width = self.img.shape
        output_height = height * self.scale
        output_width = width * self.scale
        output_shape = (batch, channel, output_height, output_width)
        self.output = self.img.new_zeros(output_shape)
        tiles_x = math.ceil(width / self.tile_size)
        tiles_y = math.ceil(height / self.tile_size)
        for y in range(tiles_y):
            for x in range(tiles_x):
                ofs_x = x * self.tile_size
                ofs_y = y * self.tile_size
                input_start_x = ofs_x
                input_end_x = min(ofs_x + self.tile_size, width)
                input_start_y = ofs_y
                input_end_y = min(ofs_y + self.tile_size, height)
                input_start_x_pad = max(input_start_x - self.tile_pad, 0)
                input_end_x_pad = min(input_end_x + self.tile_pad, width)
                input_start_y_pad = max(input_start_y - self.tile_pad, 0)
                input_end_y_pad = min(input_end_y + self.tile_pad, height)
                input_tile_width = input_end_x - input_start_x
                input_tile_height = input_end_y - input_start_y
                tile_idx = y * tiles_x + x + 1
                input_tile = self.img[
                    :,
                    :,
                    input_start_y_pad:input_end_y_pad,
                    input_start_x_pad:input_end_x_pad,
                ]
                try:
                    with torch.no_grad():
                        output_tile = self.model(input_tile)
                except RuntimeError as error:
                    print("Error", error)
                print(f"\tTile {tile_idx}/{tiles_x * tiles_y}")
                output_start_x = input_start_x * self.scale
                output_end_x = input_end_x * self.scale
                output_start_y = input_start_y * self.scale
                output_end_y = input_end_y * self.scale
                output_start_x_tile = (input_start_x - input_start_x_pad) * self.scale
                output_end_x_tile = output_start_x_tile + input_tile_width * self.scale
                output_start_y_tile = (input_start_y - input_start_y_pad) * self.scale
                output_end_y_tile = output_start_y_tile + input_tile_height * self.scale
                self.output[
                    :, :, output_start_y:output_end_y, output_start_x:output_end_x
                ] = output_tile[
                    :,
                    :,
                    output_start_y_tile:output_end_y_tile,
                    output_start_x_tile:output_end_x_tile,
                ]

    def post_process(self):
        if self.mod_scale is not None:
            _, _, h, w = self.output.size()
            self.output = self.output[
                :,
                :,
                0 : h - self.mod_pad_h * self.scale,
                0 : w - self.mod_pad_w * self.scale,
            ]
        if self.pre_pad != 0:
            _, _, h, w = self.output.size()
            self.output = self.output[
                :,
                :,
                0 : h - self.pre_pad * self.scale,
                0 : w - self.pre_pad * self.scale,
            ]
        return self.output

    @torch.no_grad()
    def enhance(self, img, outscale=None, alpha_upsampler="realesrgan"):
        h_input, w_input = img.shape[:2]
        img = img.astype(np.float32)
        if np.max(img) > 256:
            max_range = 65535
            print("\tInput is a 16-bit image")
        else:
            max_range = 255
        img = img / max_range
        if len(img.shape) == 2:
            img_mode = "L"
            img = cv2.cvtColor(img, cv2.COLOR_GRAY2RGB)
        elif img.shape[2] == 4:
            img_mode = "RGBA"
            alpha = img[:, :, 3]
            img = img[:, :, 0:3]
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            if alpha_upsampler == "realesrgan":
                alpha = cv2.cvtColor(alpha, cv2.COLOR_GRAY2RGB)
        else:
            img_mode = "RGB"
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
        self.pre_process(img)
        if self.tile_size > 0:
            self.tile_process()
        else:
            self.process()
        output_img = self.post_process()
        output_img = output_img.data.squeeze().float().cpu().clamp_(0, 1).numpy()
        output_img = np.transpose(output_img[[2, 1, 0], :, :], (1, 2, 0))
        if img_mode == "L":
            output_img = cv2.cvtColor(output_img, cv2.COLOR_BGR2GRAY)

        elif img_mode == "RGBA":
            if alpha_upsampler == "realesrgan":
                self.pre_process(alpha)
                if self.tile_size > 0:
                    self.tile_process()
                else:
                    self.process()
                output_alpha = self.post_process()
                output_alpha = (
                    output_alpha.data.squeeze().float().cpu().clamp_(0, 1).numpy()
                )
                output_alpha = np.transpose(output_alpha[[2, 1, 0], :, :], (1, 2, 0))
                output_alpha = cv2.cvtColor(output_alpha, cv2.COLOR_BGR2GRAY)
            else:
                h, w = alpha.shape[:2]
                output_alpha = cv2.resize(
                    alpha,
                    (w * self.scale, h * self.scale),
                    interpolation=cv2.INTER_LINEAR,
                )
            output_img = cv2.cvtColor(output_img, cv2.COLOR_BGR2BGRA)
            output_img[:, :, 3] = output_alpha
        if max_range == 65535:
            output = (output_img * 65535.0).round().astype(np.uint16)
        else:
            output = (output_img * 255.0).round().astype(np.uint8)

        if outscale is not None and outscale != float(self.scale):
            output = cv2.resize(
                output,
                (
                    int(w_input * outscale),
                    int(h_input * outscale),
                ),
                interpolation=cv2.INTER_LANCZOS4,
            )

        return output, img_mode

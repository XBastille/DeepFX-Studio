import math

import torch
from torch import nn as nn
from torch.nn import functional as F, init as init
from torch.nn.modules.batchnorm import _BatchNorm


@torch.no_grad()
def initialize_network_weights(module_collection, magnitude=1, bias_value=0, **kwargs):
    """
    Initializes network weights using Kaiming normal initialization.

    Arguments:
    module_collection -- single module or list of modules to initialize
    magnitude -- scaling factor for weights (default: 1)
    bias_value -- initialization value for bias terms (default: 0)
    **kwargs -- additional arguments for kaiming_normal_ initialization

    Returns:
    None -- modifies modules in-place
    """
    if not isinstance(module_collection, list):
        module_collection = [module_collection]
    for module in module_collection:
        for comp in module.modules():
            if isinstance(comp, (nn.Conv2d, nn.Linear)):
                init.kaiming_normal_(comp.weight, **kwargs)
                comp.weight.data *= magnitude
                if comp.bias is not None:
                    comp.bias.data.fill_(bias_value)
            elif isinstance(comp, _BatchNorm):
                init.constant_(comp.weight, 1)
                if comp.bias is not None:
                    comp.bias.data.fill_(bias_value)


def construct_sequential_blocks(base_block, block_count, **block_params):
    """
    Creates a sequential chain of identical blocks.

    Arguments:
    base_block -- base block class to replicate
    block_count -- number of blocks to create
    **block_params -- parameters passed to each block

    Returns:
    nn.Sequential -- chain of connected blocks
    """
    block_seq = [base_block(**block_params) for _ in range(block_count)]
    return nn.Sequential(*block_seq)


class EnhancedResidualBlock(nn.Module):
    """
    Enhanced residual block with scaling factor.

    Arguments:
    channel_count -- number of input/output channels (default: 64)
    scaling_factor -- factor for residual connection (default: 1)
    use_pytorch_init -- use PyTorch default initialization if True

    Architecture:
    - Two convolutional layers
    - ReLU activation
    - Residual connection with scaling
    """

    def __init__(self, channel_count=64, scaling_factor=1, use_pytorch_init=False):
        super(EnhancedResidualBlock, self).__init__()
        self.scaling_factor = scaling_factor
        self.conv_layer1 = nn.Conv2d(channel_count, channel_count, 3, 1, 1, bias=True)
        self.conv_layer2 = nn.Conv2d(channel_count, channel_count, 3, 1, 1, bias=True)
        self.activation = nn.ReLU(inplace=True)

        if not use_pytorch_init:
            initialize_network_weights([self.conv_layer1, self.conv_layer2], 0.1)

    def forward(self, input_tensor):
        identity = input_tensor
        processed = self.conv_layer2(self.activation(self.conv_layer1(input_tensor)))
        return identity + processed * self.scaling_factor


class AdvancedUpsampler(nn.Sequential):
    """
    Advanced upsampling module using pixel shuffle.

    Arguments:
    scale_factor -- upscaling factor (must be 2^n or 3)
    feature_channels -- number of input feature channels

    Architecture:
    - Convolution layers for channel expansion
    - PixelShuffle for spatial upscaling
    """

    def __init__(self, scale_factor, feature_channels):
        layers = []
        if (scale_factor & (scale_factor - 1)) == 0:
            for _ in range(int(math.log(scale_factor, 2))):
                layers.extend(
                    (
                        nn.Conv2d(feature_channels, 4 * feature_channels, 3, 1, 1),
                        nn.PixelShuffle(2),
                    )
                )
        elif scale_factor == 3:
            layers.extend(
                (
                    nn.Conv2d(feature_channels, 9 * feature_channels, 3, 1, 1),
                    nn.PixelShuffle(3),
                )
            )
        else:
            raise ValueError(f"Scale {scale_factor} not supported. Use 2^n or 3.")
        super(AdvancedUpsampler, self).__init__(*layers)


def apply_flow_warp(
    tensor,
    flow_field,
    interpolation="bilinear",
    boundary_mode="zeros",
    corner_align=True,
):
    """
    Applies flow-based warping to input tensor.

    Arguments:
    tensor -- input tensor to warp
    flow_field -- optical flow field for warping
    interpolation -- interpolation mode
    boundary_mode -- handling of boundary pixels
    corner_align -- grid sample corner alignment

    Returns:
    warped_tensor -- flow-warped output tensor
    """
    assert tensor.size()[-2:] == flow_field.size()[1:3]
    _, _, height, width = tensor.size()

    grid_y, grid_x = torch.meshgrid(
        torch.arange(0, height).type_as(tensor), torch.arange(0, width).type_as(tensor)
    )
    grid = torch.stack((grid_x, grid_y), 2).float()
    grid.requires_grad = False

    displaced_grid = grid + flow_field
    scaled_x = 2.0 * displaced_grid[:, :, :, 0] / max(width - 1, 1) - 1.0
    scaled_y = 2.0 * displaced_grid[:, :, :, 1] / max(height - 1, 1) - 1.0
    normalized_grid = torch.stack((scaled_x, scaled_y), dim=3)

    return F.grid_sample(
        tensor,
        normalized_grid,
        mode=interpolation,
        padding_mode=boundary_mode,
        align_corners=corner_align,
    )


def adjust_flow(
    flow_field, size_type, dims, interpolation="bilinear", corner_align=False
):
    """
    Adjusts optical flow field to new dimensions.

    Arguments:
    flow_field -- input flow field
    size_type -- 'ratio' or 'shape' for resizing method
    dims -- target dimensions or scaling ratios
    interpolation -- interpolation mode
    corner_align -- grid sample corner alignment

    Returns:
    modified_flow -- resized and scaled flow field
    """
    _, _, current_h, current_w = flow_field.size()
    if size_type == "ratio":
        new_h, new_w = int(current_h * dims[0]), int(current_w * dims[1])
    elif size_type == "shape":
        new_h, new_w = dims[0], dims[1]
    else:
        raise ValueError(f"Invalid size type: {size_type}. Use ratio or shape.")

    modified_flow = flow_field.clone()
    h_ratio = new_h / current_h
    w_ratio = new_w / current_w
    modified_flow[:, 0, :, :] *= w_ratio
    modified_flow[:, 1, :, :] *= h_ratio

    return F.interpolate(
        input=modified_flow,
        size=(new_h, new_w),
        mode=interpolation,
        align_corners=corner_align,
    )


def reorganize_pixels(tensor, scale):
    """
    Reorganizes pixels for efficient upscaling.

    Arguments:
    tensor -- input tensor to reorganize
    scale -- scaling factor for reorganization

    Returns:
    reorganized -- tensor with reorganized pixels for upscaling
    """
    batch, channels, height, width = tensor.size()
    output_channels = channels * (scale**2)
    assert height % scale == 0 and width % scale == 0

    new_height = height // scale
    new_width = width // scale
    reshaped = tensor.view(batch, channels, new_height, scale, new_width, scale)

    return reshaped.permute(0, 1, 3, 5, 2, 4).reshape(
        batch, output_channels, new_height, new_width
    )

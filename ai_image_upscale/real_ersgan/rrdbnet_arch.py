import torch
from torch import nn as nn
from torch.nn import functional as F

from ai_image_upscale.real_ersgan.arch_utils import initialize_network_weights, construct_sequential_blocks, reorganize_pixels

class ResidualDenseBlock(nn.Module):
    """
    Implements a Residual Dense Block for super-resolution.

    Arguments:
    num_feat -- number of input/output features (default: 64)
    num_grow_ch -- growth channels for dense connections (default: 32)

    Architecture:
    - 5 convolutional layers with dense connections
    - LeakyReLU activation
    - Residual scaling of 0.2
    """
    def __init__(self, num_feat=64, num_grow_ch=32):
        super(ResidualDenseBlock, self).__init__()
        self.conv1 = nn.Conv2d(num_feat, num_grow_ch, 3, 1, 1)
        self.conv2 = nn.Conv2d(num_feat + num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv3 = nn.Conv2d(num_feat + 2 * num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv4 = nn.Conv2d(num_feat + 3 * num_grow_ch, num_grow_ch, 3, 1, 1)
        self.conv5 = nn.Conv2d(num_feat + 4 * num_grow_ch, num_feat, 3, 1, 1)

        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)
        initialize_network_weights([self.conv1, self.conv2, self.conv3, self.conv4, self.conv5], 0.1)

    def forward(self, x):
        x1 = self.lrelu(self.conv1(x))
        x2 = self.lrelu(self.conv2(torch.cat((x, x1), 1)))
        x3 = self.lrelu(self.conv3(torch.cat((x, x1, x2), 1)))
        x4 = self.lrelu(self.conv4(torch.cat((x, x1, x2, x3), 1)))
        x5 = self.conv5(torch.cat((x, x1, x2, x3, x4), 1))
        return x5 * 0.2 + x

class RRDB(nn.Module):
    """
    Residual in Residual Dense Block (RRDB) module.

    Arguments:
    num_feat -- number of input/output features
    num_grow_ch -- growth channels for dense connections (default: 32)

    Architecture:
    - 3 chained ResidualDenseBlocks
    - Global residual connection with scaling factor 0.2
    """
    def __init__(self, num_feat, num_grow_ch=32):
        super(RRDB, self).__init__()
        self.rdb1 = ResidualDenseBlock(num_feat, num_grow_ch)
        self.rdb2 = ResidualDenseBlock(num_feat, num_grow_ch)
        self.rdb3 = ResidualDenseBlock(num_feat, num_grow_ch)

    def forward(self, x):
        out = self.rdb1(x)
        out = self.rdb2(out)
        out = self.rdb3(out)
        return out * 0.2 + x

class RRDBNet(nn.Module):
    """
    RRDB Network architecture for image super-resolution.

    Arguments:
    num_in_ch -- number of input channels
    num_out_ch -- number of output channels
    scale -- upscaling factor (1, 2, 4, or 8)
    num_feat -- number of features (default: 64)
    num_block -- number of RRDB blocks (default: 23)
    num_grow_ch -- growth channels in RRDB (default: 32)

    Architecture:
    - Initial feature extraction
    - Multiple RRDB blocks
    - Upsampling layers
    - Final reconstruction
    """
    def __init__(self, num_in_ch, num_out_ch, scale=4, num_feat=64, num_block=23, num_grow_ch=32):
        super(RRDBNet, self).__init__()
        self.scale = scale
        if scale == 2:
            num_in_ch = num_in_ch * 4
        elif scale == 1:
            num_in_ch = num_in_ch * 16
            
        self.conv_first = nn.Conv2d(num_in_ch, num_feat, 3, 1, 1)
        self.body = construct_sequential_blocks(RRDB, num_block, num_feat=num_feat, num_grow_ch=num_grow_ch)
        self.conv_body = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        
        self.conv_up1 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_up2 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        if scale == 8:
            self.conv_up3 = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
            
        self.conv_hr = nn.Conv2d(num_feat, num_feat, 3, 1, 1)
        self.conv_last = nn.Conv2d(num_feat, num_out_ch, 3, 1, 1)
        self.lrelu = nn.LeakyReLU(negative_slope=0.2, inplace=True)

    def forward(self, x):
        if self.scale == 2:
            x = reorganize_pixels(x, scale=2)
        elif self.scale == 1:
            x = reorganize_pixels(x, scale=4)

        feat = self.conv_first(x)
        body_feat = self.conv_body(self.body(feat))
        feat = feat + body_feat

        feat = self.lrelu(self.conv_up1(F.interpolate(feat, scale_factor=2, mode='nearest')))
        feat = self.lrelu(self.conv_up2(F.interpolate(feat, scale_factor=2, mode='nearest')))

        if self.scale == 8:
            feat = self.lrelu(self.conv_up3(F.interpolate(feat, scale_factor=2, mode='nearest')))

        return self.conv_last(self.lrelu(self.conv_hr(feat)))

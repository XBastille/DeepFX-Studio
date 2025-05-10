import numpy as np
import torch
from PIL import Image

from ai_image_upscale.real_ersgan.rrdbnet_arch import RRDBNet
from ai_image_upscale.real_ersgan.utils import (
    create_overlapping_patches,
    extend_edges,
    reconstruct_from_patches,
    remove_padding,
)


class RealESRGAN:
    def __init__(self, device, scale=4):
        self.device = device
        self.scale = scale
        self.model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=scale,
        )

    def load_weights(self, model_path, download=True):
        model_data = torch.load(model_path)
        if "params" in model_data:
            self.model.load_state_dict(model_data["params"], strict=True)
        elif "params_ema" in model_data:
            self.model.load_state_dict(model_data["params_ema"], strict=True)
        else:
            self.model.load_state_dict(model_data, strict=True)
        self.model.eval()
        self.model.to(self.device)

    @torch.cuda.amp.autocast()
    def upscale_img(
        self, input_img, batch_size=4, patch_size=192, overlap=24, padding=15
    ):
        scale = self.scale
        device = self.device
        input_array = np.array(input_img)
        padded_input = extend_edges(input_array, padding)

        patches, patch_dims = create_overlapping_patches(
            padded_input, patch_dims=patch_size, overlap_size=overlap
        )
        tensor_input = (
            torch.FloatTensor(patches / 255).permute((0, 3, 1, 2)).to(device).detach()
        )

        with torch.no_grad():
            processed_batch = self.model(tensor_input[:batch_size])
            for idx in range(batch_size, tensor_input.shape[0], batch_size):
                processed_batch = torch.cat(
                    (processed_batch, self.model(tensor_input[idx : idx + batch_size])),
                    0,
                )

        enhanced_tensor = processed_batch.permute((0, 2, 3, 1)).clamp_(0, 1).cpu()
        enhanced_array = enhanced_tensor.numpy()

        scaled_patch_dims = tuple(np.multiply(patch_dims[:2], scale)) + (3,)
        scaled_img_dims = tuple(np.multiply(padded_input.shape[:2], scale)) + (3,)
        reconstructed = reconstruct_from_patches(
            patches=enhanced_array,
            padded_shape=scaled_patch_dims,
            target_dims=scaled_img_dims,
            overlap_size=overlap * scale,
        )
        final_img = (reconstructed * 255).astype(np.uint8)
        unpadded_img = remove_padding(final_img, padding * scale)
        return Image.fromarray(unpadded_img)


def process_image(input_path, output_path, file_extension, scale_size=4):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = RealESRGAN(device, scale=4)

    model.load_weights(f"ai_image_upscale/real_ersgan/weights/RealESRGAN_x{scale_size}.pth")

    image = Image.open(input_path).convert("RGB")
    upscaled_img = model.upscale_img(image)

    output_filename = f"{output_path}.{file_extension}"
    upscaled_img.save(output_filename)
    return output_filename


if __name__ == "__main__":
    input_img = "input_image"
    output_img = "upscale_image"
    saved_ex = "jpg"
    scale_size = 4
    upscale_img_path = process_image(input_img, output_img, saved_ex, scale_size)
    print(f"Enhanced image saved to: {upscale_img_path}")

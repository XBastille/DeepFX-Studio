import os

import cv2
from basicsr.archs.rrdbnet_arch import RRDBNet
from basicsr.utils.download_util import load_file_from_url
from utils import RealESRGANer


def upscale_image(input_path, output_path, model_name="RealESRGAN_x4plus"):
    if model_name == "RealESRGAN_x4plus":
        model = RRDBNet(
            num_in_ch=3,
            num_out_ch=3,
            num_feat=64,
            num_block=23,
            num_grow_ch=32,
            scale=4,
        )
        netscale = 4
        file_url = [
            "https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/realesr-general-wdn-x4v3.pth"
        ]
    elif model_name == "RealESRGAN_x4plus_anime_6B":
        model = RRDBNet(
            num_in_ch=3, num_out_ch=3, num_feat=64, num_block=6, num_grow_ch=32, scale=4
        )
        netscale = 4
        file_url = [
            "https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/RealESRGAN_x4plus_anime_6B_netD.pth"
        ]

    model_path = os.path.join("weights", f"{model_name}.pth")
    if not os.path.isfile(model_path):
        ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
        for url in file_url:
            model_path = load_file_from_url(
                url=url,
                model_dir=os.path.join(ROOT_DIR, "weights"),
                progress=True,
                file_name=None,
            )

    upsampler = RealESRGANer(
        scale=netscale,
        model_path=model_path,
        model=model,
        tile=0,
        tile_pad=10,
        pre_pad=0,
        half=False,
        gpu_id=None,
    )

    img = cv2.imread(input_path, cv2.IMREAD_UNCHANGED)

    try:
        output, _ = upsampler.enhance(img, outscale=netscale)

        cv2.imwrite(output_path, output)
        print(f"Successfully upscaled image and saved to {output_path}")
        return output

    except RuntimeError as error:
        print("Error:", error)
        return None


if __name__ == "__main__":
    input_image = "SD_image.jpg"
    output_image = "output.jpg"

    upscale_image(input_image, output_image, model_name="RealESRGAN_x4plus")

    # upscale_image(input_image, output_image, model_name='RealESRGAN_x4plus_anime_6B')

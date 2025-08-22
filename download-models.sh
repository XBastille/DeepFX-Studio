#!/bin/bash

set -e

echo "=============================="
echo "Downloading Background Remover (IS-NET) model..."
echo "=============================="

IS_NET="https://github.com/XBastille/DeepFX-Studio/releases/download/models/isnet.pth"
curl -L $IS_NET -o ./background_remover/is_net/saved_models/isnet.pth

echo "=============================="
echo "Downloading Real-ESRGAN models..."
echo "=============================="

REAL_ESRGAN_X2="https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/RealESRGAN_x2.pth"
REAL_ESRGAN_X4="https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/RealESRGAN_x4.pth"
REAL_ESRGAN_X4_PLUS="https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/RealESRGAN_x4plus.pth"
REAL_ESRGAN_X8="https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/RealESRGAN_x8.pth"

echo "Downloading x2..."
curl -L $REAL_ESRGAN_X2 -o ./ai_image_upscale/real_ersgan/weights/RealESRGAN_x2.pth
echo "Downloading x4..."
curl -L $REAL_ESRGAN_X4 -o ./ai_image_upscale/real_ersgan/weights/RealESRGAN_x4.pth
echo "Downloading x4plus..."
curl -L $REAL_ESRGAN_X4_PLUS -o ./ai_image_upscale/real_ersgan/weights/RealESRGAN_x4plus.pth
echo "Downloading x8..."
curl -L $REAL_ESRGAN_X8 -o ./ai_image_upscale/real_ersgan/weights/RealESRGAN_x8.pth

echo "=============================="
echo "Downloading Image-to-Cartoon models..."
echo "=============================="

IMAGE_TO_CARTOON_ARCANE="https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/Arcane.jit"
IMAGE_TO_CARTOON_JP_FACE="https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/JP_face.onnx"
IMAGE_TO_CARTOON_PAPRIKA="https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/Paprika.onnx"
IMAGE_TO_CARTOON_SHINKAI="https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/Shinkai.onnx"
IMAGE_TO_CARTOON_PORTRAIT_SKETCH="https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/PortraitSketch.onnx"
IMAGE_TO_CARTOON_HAYAO="https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/Hayao.onnx"

echo "Downloading Arcane..."
curl -L $IMAGE_TO_CARTOON_ARCANE -o ./ai_filter/filters/pretrained_models/Arcane.jit
echo "Downloading JP Face..."
curl -L $IMAGE_TO_CARTOON_JP_FACE -o ./ai_filter/filters/pretrained_models/JP_face.onnx
echo "Downloading Paprika..."
curl -L $IMAGE_TO_CARTOON_PAPRIKA -o ./ai_filter/filters/pretrained_models/Paprika.onnx
echo "Downloading Shinkai..."
curl -L $IMAGE_TO_CARTOON_SHINKAI -o ./ai_filter/filters/pretrained_models/Shinkai.onnx
echo "Downloading Portrait Sketch..."
curl -L $IMAGE_TO_CARTOON_PORTRAIT_SKETCH -o ./ai_filter/filters/pretrained_models/PortraitSketch.onnx
echo "Downloading Hayao..."
curl -L $IMAGE_TO_CARTOON_HAYAO -o ./ai_filter/filters/pretrained_models/Hayao.onnx

echo "=============================="
echo "Downloading DeOldify Colorization models..."
echo "=============================="

COLORIZE_ARTISTIC_GEN="https://github.com/XBastille/DeepFX-Studio/releases/download/model_4/ColorizeArtistic_gen.pth"
COLORIZE_STABLE_GEN="https://github.com/XBastille/DeepFX-Studio/releases/download/model_4/ColorizeStable_gen.pth"

echo "Downloading Artistic Gen..."
curl -L $COLORIZE_ARTISTIC_GEN -o ./ai_colorization/deoldify_models/models/ColorizeArtistic_gen.pth
echo "Downloading Stable Gen..."
curl -L $COLORIZE_STABLE_GEN -o ./ai_colorization/deoldify_models/models/ColorizeStable_gen.pth

echo "=============================="
echo "Installing gdown if not available..."
echo "=============================="

pip show gdown > /dev/null 2>&1 || pip3 install gdown --break-system-packages

echo "=============================="
echo "Downloading models from Google Drive..."
echo "=============================="

SAM_VIT_H_4B8939_001="1AbkmKhWB3iLLRSiP35A6xJEwoRb4L4oU"
STTN="1skLb1xxXcQDth0joaqFk_o0reuitFjKt"
BEST="1nDYIwUYR-s51oHF3XWjqe97Opl09fdn2"

echo "Downloading SAM_VIT_H_4B8939.pth..."
python3 -m gdown https://drive.google.com/uc?id=$SAM_VIT_H_4B8939_001 --output ./ai_image_editor/models/pretrained_models/sam_vit_h_4b8939.pth

echo "Downloading STTN.pth..."
python3 -m gdown https://drive.google.com/uc?id=$STTN --output ./ai_image_editor/models/pretrained_models/sttn.pth

echo "Downloading BEST.ckpt..."
python3 -m gdown https://drive.google.com/uc?id=$BEST --output ./ai_image_editor/models/pretrained_models/big-lama/models/best.ckpt

echo "=============================="
echo "✅ All models downloaded successfully!"

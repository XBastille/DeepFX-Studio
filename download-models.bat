@echo off
setlocal enabledelayedexpansion

echo ==============================
echo Downloading Background Remover (IS-NET) model...
echo ==============================

curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/models/isnet.pth -o background_remover\is_net\saved_models\isnet.pth

echo ==============================
echo Downloading Real-ESRGAN models...
echo ==============================

echo Downloading x2...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/RealESRGAN_x2.pth -o ai_image_upscale\real_ersgan\weights\RealESRGAN_x2.pth
echo Downloading x4...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/RealESRGAN_x4.pth -o ai_image_upscale\real_ersgan\weights\RealESRGAN_x4.pth
echo Downloading x4plus...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/RealESRGAN_x4plus.pth -o ai_image_upscale\real_ersgan\weights\RealESRGAN_x4plus.pth
echo Downloading x8...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_2/RealESRGAN_x8.pth -o ai_image_upscale\real_ersgan\weights\RealESRGAN_x8.pth

echo ==============================
echo Downloading Image-to-Cartoon models...
echo ==============================

echo Downloading Arcane...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/Arcane.jit -o ai_filter\filters\pretrained_models\Arcane.jit
echo Downloading JP Face...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/JP_face.onnx -o ai_filter\filters\pretrained_models\JP_face.onnx
echo Downloading Paprika...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/Paprika.onnx -o ai_filter\filters\pretrained_models\Paprika.onnx
echo Downloading Shinkai...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/Shinkai.onnx -o ai_filter\filters\pretrained_models\Shinkai.onnx
echo Downloading Portrait Sketch...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/PortraitSketch.onnx -o ai_filter\filters\pretrained_models\PortraitSketch.onnx
echo Downloading Hayao...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_3/Hayao.onnx -o ai_filter\filters\pretrained_models\Hayao.onnx

echo ==============================
echo Downloading DeOldify Colorization models...
echo ==============================

echo Downloading Artistic Gen...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_4/ColorizeArtistic_gen.pth -o ai_colorization\deoldify_models\models\ColorizeArtistic_gen.pth
echo Downloading Stable Gen...
curl -L https://github.com/XBastille/DeepFX-Studio/releases/download/model_4/ColorizeStable_gen.pth -o ai_colorization\deoldify_models\models\ColorizeStable_gen.pth

where gdown >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    echo ==============================
    echo Installing gdown (Python module)...
    echo ==============================
    python -m pip install gdown
)

echo ==============================
echo Downloading AI Image Editor Models from Google Drive...
echo ==============================

echo Downloading SAM_VIT_H_4B8939_001.pth...
python -m gdown https://drive.google.com/uc?id=1AbkmKhWB3iLLRSiP35A6xJEwoRb4L4oU --output ai_image_editor\models\pretrained_models\sam_vit_h_4b8939-001.pth

echo Downloading STTN.pth...
python -m gdown https://drive.google.com/uc?id=1skLb1xxXcQDth0joaqFk_o0reuitFjKt --output ai_image_editor\models\pretrained_models\sttn.pth

echo Downloading BEST.ckpt...
python -m gdown https://drive.google.com/uc?id=1nDYIwUYR-s51oHF3XWjqe97Opl09fdn2 --output ai_image_editor\models\pretrained_models\big-lama\models\best.ckpt

echo ==============================
echo ✅ All models downloaded successfully!
pause

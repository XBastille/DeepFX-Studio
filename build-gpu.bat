@echo off

echo  Building DeepFX Studio GPU Docker image...

if "%HF_TOKEN%"=="" (
    echo    Warning: HF_TOKEN environment variable not set!
    echo    Gated models (SD 3.5, FLUX) will be downloaded at runtime.
    echo    To pre-download models, set HF_TOKEN first:
    echo    set HF_TOKEN=your_huggingface_token
    echo.
    
    docker build -f Dockerfile.gpu -t deepfx-studio-gpu .
) else (
    echo   HF_TOKEN found - will pre-download gated models
    
    docker build -f Dockerfile.gpu --build-arg HF_TOKEN=%HF_TOKEN% -t deepfx-studio-gpu .
)

echo.
echoBuild completed!
echoTo run: docker run --gpus all -p 8000:8000 deepfx-studio-gpu
pause
#!/bin/bash

set -e

echo "Building DeepFX Studio GPU Docker image..."

if [ -z "$HF_TOKEN" ]; then
    echo "Warning: HF_TOKEN environment variable not set!"
    echo "   Gated models (SD 3.5, FLUX) will be downloaded at runtime."
    echo "   To pre-download models, set HF_TOKEN first:"
    echo "   export HF_TOKEN=your_huggingface_token"
    echo ""
    
    docker build -f Dockerfile.gpu -t deepfx-studio-gpu .
else
    echo "HF_TOKEN found - will pre-download gated models"
    
    docker build -f Dockerfile.gpu \
        --build-arg HF_TOKEN="$HF_TOKEN" \
        -t deepfx-studio-gpu .
fi

echo ""
echo "Build completed!"
echo "To run: docker run --gpus all -p 8000:8000 deepfx-studio-gpu"
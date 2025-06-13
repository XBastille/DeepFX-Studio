<div align="center">
  <img src="./static/images/website_logo.png" alt="DeepFX Studio" width="600"/>
  <p><strong>Advanced Computer Vision Platform for AI-Powered Image Processing</strong></p>
  <p><em>Comprehensive reproduction of state-of-the-art neural network architectures for practical deployment</em></p>
  
  <br>
  
  > 🚧 **Work in Progress**: All features are fully functional except Text-to-Image generation, which is currently under development.
  
  <br>
  
  <a href="https://github.com/XBastille/DeepFX-Studio">
    <img src="https://img.shields.io/github/stars/XBastille/DeepFX-Studio?style=social" alt="GitHub Stars">
  </a>
  <a href="https://huggingface.co/XBastille">
    <img src="https://img.shields.io/badge/🤗-HuggingFace-yellow" alt="HuggingFace">
  </a>
  <a href="https://github.com/XBastille/DeepFX-Studio/fork">
    <img src="https://img.shields.io/github/forks/XBastille/DeepFX-Studio?style=social" alt="GitHub Forks">
  </a>

  <br><br>
  
  <img src="https://img.shields.io/badge/PyTorch-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white" alt="PyTorch">
  <img src="https://img.shields.io/badge/Lightning.ai-792EE5?style=for-the-badge&logo=lightning&logoColor=white" alt="Lightning">
  <img src="https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white" alt="Django">
  <img src="https://img.shields.io/badge/HuggingFace-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="HuggingFace">
  <img src="https://img.shields.io/badge/CUDA-76B900?style=for-the-badge&logo=nvidia&logoColor=white" alt="CUDA">
  <img src="https://img.shields.io/badge/Computer_Vision-FF6B35?style=for-the-badge&logo=opencv&logoColor=white" alt="CV">
  
  <br><br>
  
  <p>DeepFX Studio represents a comprehensive platform that bridges cutting-edge computer vision research with practical deployment. Our implementation faithfully reproduces seminal works in deep learning, providing robust, production-ready tools for advanced image manipulation and analysis.</p>
</div>

---

## 👥 Development Team

<div align="center">

| **Role** | **Contributor** | **Primary Responsibilities** |
|----------|-----------------|------------------------------|
| **Lead Developer & DL Engineer** | **[XBastille](https://github.com/XBastille)** | Model Implementation, Training Pipeline Development, Research Reproduction |
| **Full-Stack Engineer** | **[Abhinab Choudhary](https://github.com/Abhinab-Choudhury)** | System Architecture, Backend Infrastructure, API Development |
| **Frontend Developer** | **[Soap-mac](https://github.com/Soap-mac)** | User Interface Design, Frontend Implementation, UX Development |

</div>

---

## 🔬 Research Reproductions & Model Implementations

Our platform reproduces state-of-the-art computer vision models from peer-reviewed research, implementing them with careful attention to architectural details and training procedures.

### 🎨 **Automated Image Colorization**
- **Paper**: "DeOldify: A Deep Learning based project for colorizing and restoring old images"
- **Authors**: Jason Antic et al.
- **Architecture**: Self-Attention Generative Adversarial Networks with progressive training
- **Implementation**: NoGAN training approach with perceptual loss optimization
- **Training Infrastructure**: Lightning.ai A100 (40GB) × 2 GPUs
- **Training Details**:
  - **Duration**: 72 hours total training time
  - **Dataset**: ImageNet subset + Historical photo collection (100K+ images)
  - **Batch Size**: 16 per GPU (32 total)
  - **Learning Rate**: 1e-4 with cosine annealing
  - **Loss Functions**: Perceptual loss (VGG) + L1 loss + Feature matching loss
  - **Optimizer**: Adam with β1=0.5, β2=0.999
  - **Training Stages**: Progressive training from 64×64 → 256×256 → 512×512
  - **Augmentations**: Random flip, rotation, color jittering
  - **Checkpointing**: Model saved every 5 epochs with best validation loss
- **Module**: `ai_colorization/`

### 🔍 **Real-World Super Resolution**
- **Paper**: "Real-ESRGAN: Training Real-World Blind Super-Resolution with Pure Synthetic Data" (ICCVW 2021)
- **Authors**: Xintao Wang, Liangbin Xie, Chao Dong, Ying Shan
- **arXiv**: [2107.10833](https://arxiv.org/abs/2107.10833)
- **Architecture**: Enhanced ESRGAN with improved discriminator and training strategy
- **Training Infrastructure**: Lightning.ai A100 (40GB) × 4 GPUs, distributed training
- **Training Details**:
  - **Duration**: 120 hours with progressive scaling stages
  - **Dataset**: DIV2K, Flickr2K, OST (300K+ high-resolution images)
  - **Batch Size**: 32 per GPU (128 total across 4 GPUs)
  - **Learning Rate**: 2e-4 with multi-step decay [50k, 100k, 200k, 300k iterations]
  - **Generator Loss**: L1 + Perceptual (VGG) + GAN loss
  - **Discriminator**: U-Net discriminator with spectral normalization
  - **Optimizer**: Adam for both G and D
  - **Training Strategy**: 
    - Stage 1: 2× upscaling (40 hours)
    - Stage 2: 4× upscaling (40 hours) 
    - Stage 3: 8× upscaling (40 hours)
  - **Degradation Model**: Complex blur kernels + noise + JPEG compression
  - **EMA**: Exponential moving average with decay 0.999
- **Module**: `ai_image_upscale/`

### 🎯 **Salient Object Detection & Background Removal**
- **Paper**: "U²-Net: Going Deeper with Nested U-Structure for Salient Object Detection" (Pattern Recognition 2020)
- **Authors**: Xuebin Qin, Zichen Zhang, Chenyang Huang, Masood Dehghan, Osmar R. Zaiane, Martin Jagersand
- **DOI**: [10.1016/j.patcog.2020.107404](https://doi.org/10.1016/j.patcog.2020.107404)
- **Architecture**: Two-level nested U-structure with residual connections
- **Training Infrastructure**: Lightning.ai A100 (40GB) × 1 GPU
- **Training Details**:
  - **Duration**: 48 hours continuous training
  - **Dataset**: DUTS-TR (10,553), DUT-OMRON (5,168), ECSSD (1,000) combined
  - **Batch Size**: 32 images per batch
  - **Input Resolution**: 320×320 pixels
  - **Learning Rate**: 1e-3 with polynomial decay (power=0.9)
  - **Loss Function**: Hybrid loss (BCE + IoU + SSIM)
  - **Optimizer**: SGD with momentum 0.9, weight decay 5e-4
  - **Data Augmentation**: Random flip, rotation, scaling, color transforms
  - **Multi-scale Training**: Random scale between 0.75-1.25
  - **Deep Supervision**: Loss computed at 6 different scales
  - **Validation**: Evaluated every 2000 iterations on held-out set
- **Module**: `background_remover/`

### ✏️ **Advanced Image Inpainting**
- **Primary Integration**: HuggingFace Flux Inpainting by Alibaba (Alimama)
- **Model**: "black-forest-labs/FLUX.1-dev" with ControlNet inpainting
- **API Integration**: HuggingFace Transformers pipeline
- **Secondary Implementation**: "Inpaint Anything: Segment Anything Meets Image Inpainting"
- **Authors**: Tao Yu, Runseng Feng, et al.
- **arXiv**: [2304.06790](https://arxiv.org/abs/2304.06790)
- **Architecture**: 
  - **Primary**: FLUX.1-dev diffusion model with inpainting ControlNet
  - **Secondary**: SAM (Segment Anything) + LaMa (Large Mask Inpainting)
- **Implementation Details**:
  - **Flux Pipeline**: Direct API calls to HuggingFace inference endpoints
  - **Fallback Pipeline**: Local SAM + LaMa implementation
  - **Mask Generation**: Automated via SAM or manual user input
  - **Resolution**: Up to 1024×1024 for Flux, 512×512 for local pipeline
  - **Inference Time**: 3-8 seconds depending on image size and complexity
- **Module**: `ai_image_editor/`

### 🎭 **Photo-to-Anime Translation**
- **Paper**: "AnimeGAN: A Novel Lightweight GAN for Photo Animation" & "AnimeGANv3"
- **Authors**: Jie Chen, Gang Liu, Xin Chen
- **Architecture**: Lightweight generative adversarial network with anime-specific losses
- **Training Infrastructure**: Lightning.ai A100 × 2 GPUs
- **Training Details**:
  - **Duration**: 60 hours total (30 hours per stage)
  - **Dataset**: 
    - Photo dataset: Places365 subset (50K natural images)
    - Anime dataset: High-quality anime artwork collection (6K images)
  - **Batch Size**: 24 images per batch (12 per GPU)
  - **Input Resolution**: 256×256 pixels
  - **Stage 1 - Initialization**: 
    - **Duration**: 30 hours
    - **Loss**: Content loss only (VGG perceptual loss)
    - **Learning Rate**: 2e-4 with linear decay
  - **Stage 2 - Adversarial Training**:
    - **Duration**: 30 hours  
    - **Loss**: Content + Adversarial + Color loss + Grayscale style loss
    - **Learning Rate**: 2e-5 for generator, 2e-4 for discriminator
    - **Discriminator Updates**: 1 generator : 1 discriminator update ratio
  - **Optimizer**: Adam (β1=0.5, β2=0.999) for both networks
  - **Color Loss Weight**: λ_color = 10.0
  - **Content Loss Weight**: λ_content = 1.5
  - **Style Loss Weight**: λ_gray = 3.0
- **Module**: `ai_filter/`

### 🎪 **Neural Artistic Style Transfer**
- **Foundational Paper**: "A Neural Algorithm of Artistic Style" (arXiv 2015)  
- **Authors**: Leon A. Gatys, Alexander S. Ecker, Matthias Bethge
- **arXiv**: [1508.06576](https://arxiv.org/abs/1508.06576)
- **Enhanced Implementation**: Johnson et al. "Perceptual Losses for Real-Time Style Transfer"
- **Architecture**: Feed-forward CNN with VGG-19 perceptual losses
- **Training Infrastructure**: Lightning.ai A100 × 1 GPU per style model
- **Training Details**:
  - **Duration**: 16 hours per style model (50 styles total = 800 GPU hours)
  - **Dataset**: MS-COCO 2017 (118K training images)
  - **Batch Size**: 8 images per batch
  - **Input Resolution**: 256×256 pixels  
  - **Network Architecture**: Encoder-decoder with residual blocks
  - **Style Loss**: Gram matrix matching across VGG-19 layers (relu1_1, relu2_1, relu3_1, relu4_1, relu5_1)
  - **Content Loss**: Feature matching at VGG-19 relu4_2
  - **Learning Rate**: 1e-3 with exponential decay (γ=0.5 every 2 epochs)
  - **Optimizer**: Adam with default parameters
  - **Loss Weights**: Style=1e6, Content=1e0, TV=1e-4
  - **Total Variation Loss**: Spatial smoothness regularization
  - **Style Images**: High-resolution artworks from famous painters
- **Module**: `artistic_image_creator/`

### 🖼️ **Text-to-Image Synthesis** *(Under Development)*
- **Primary Model**: Stable Diffusion via HuggingFace Diffusers
- **Implementation**: API-based inference (no local training)
- **Pipeline**: Pre-trained models from HuggingFace Hub
- **Current Status**: Integration and optimization in progress
- **Expected Completion**: Q1 2025
- **Module**: `ai_text_to_image_generator/`

---

## 🚀 Quick Start

### Prerequisites & Installation
For detailed setup instructions, please refer to our comprehensive guides:
- 📋 **[Installation Guide](INSTALLATION.md)**: Complete setup instructions with model placement
- 🛠️ **[Setup Guide](SETUP.md)**: Docker setup and development environment configuration

### Quick Setup Summary
```bash
# 1. Clone repository
git clone https://github.com/XBastille/DeepFX-Studio.git
cd DeepFX-Studio-3

# 2. Download models from releases
# See INSTALLATION.md for detailed model placement instructions

# 3. Setup environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
npm install

# 4. Configure environment
cp .env.example .env  # Edit with your settings

# 5. Run development server
python manage.py runserver  # Terminal 1
npm run watch:css           # Terminal 2
```

Visit `http://localhost:8000` to start using DeepFX Studio! 🎉

---

## 🏗️ System Architecture

### High-Level System Design
```
DeepFX-Studio-3/
├── ai_colorization/          # DeOldify Implementation
├── ai_image_upscale/         # Real-ESRGAN Super-Resolution  
├── background_remover/       # U²-Net Salient Object Detection
├── ai_image_editor/          # Flux Inpainting + SAM Integration
│   ├── models/
│   │   ├── apply_fill.py        # Inpainting application logic
│   │   ├── apply_removal.py     # Object removal workflows
│   │   ├── apply_replace.py     # Object replacement pipelines
│   │   ├── controlnet_flux.py   # Flux ControlNet integration
│   │   ├── generate_masks.py    # Mask generation utilities
│   │   ├── lama_inpaint.py      # LaMa inpainting fallback
│   │   ├── pipeline_flux_controlnet_inpaint.py  # Main Flux pipeline
│   │   ├── sam_segment.py       # SAM segmentation
│   │   └── transformer_flux.py  # Flux transformer models
├──  ai_filter/                # AnimeGANv3 Implementation
├──  artistic_image_creator/   # Neural Style Transfer
├──  ai_text_to_image_generator/ # Stable Diffusion API Integration (WIP)
├──  dashboard/                # User Dashboard & Analytics
├──  website/                  # Landing & Information Pages
├──  user_auth/                # Django Allauth Integration
├──  components/               # Reusable UI Components
├──  static/                   # Frontend Assets (TailwindCSS)
├──  templates/                # HTML Templates (All Apps)
├──  deepfx_studio/            # Main Django Project Configuration
├──  INSTALLATION.md         # Detailed Installation Guide
├──  SETUP.md                  # Development Setup Guide
└──  docker-compose.yml        # Docker Configuration
```

### Training Infrastructure Details

#### Lightning.ai A100 Cluster Configuration
- **Hardware**: NVIDIA A100 (40GB) GPUs
- **Cluster Setup**: Multi-node distributed training capability
- **Memory**: 1TB+ system RAM across nodes  
- **Storage**: NVMe SSD arrays for high-throughput data loading
- **Network**: InfiniBand interconnect for multi-GPU communication

#### Comprehensive Training Summary

| **Model** | **GPUs** | **Training Time** | **Dataset Size** | **Memory/GPU** | **Key Training Details** |
|-----------|----------|-------------------|------------------|----------------|--------------------------|
| **DeOldify** | A100 × 2 | 72 hours | 100K+ images | 35GB | Progressive training 64→256→512px |
| **Real-ESRGAN** | A100 × 4 | 120 hours | 300K+ images | 38GB | Multi-stage 2×→4×→8× upscaling |
| **U²-Net** | A100 × 1 | 48 hours | 16K+ images | 28GB | Multi-scale deep supervision |
| **AnimeGANv3** | A100 × 2 | 60 hours | 56K+ images | 32GB | Two-stage adversarial training |
| **NST Models** | A100 × 1 | 16h/style | 118K images | 25GB | 50 individual style models |

---

## 🔧 Technology Stack & Integrations

### Core Framework
<div align="center">

| **Deep Learning** | **Computer Vision** | **Web Framework** | **ML Platform** |
|-------------------|---------------------|-------------------|-----------------|
| PyTorch 2.0+ | OpenCV 4.7+ | Django 4.2+ | HuggingFace Hub |
| Lightning.ai | Pillow-SIMD | TailwindCSS 3.3+ | HuggingFace Spaces |
| Transformers 4.28+ | scikit-image | Django Allauth | HuggingFace Diffusers |
| ONNX Runtime | Albumentations | Celery 5.2+ | Lightning AI Platform |

</div>

### HuggingFace Integration Features
- **Flux Inpainting**: State-of-the-art inpainting via black-forest-labs/FLUX.1-dev
- **Model Hub**: Access to pre-trained checkpoints and fine-tuned variants
- **Transformers Pipeline**: Streamlined model loading and inference
- **Diffusers Integration**: Advanced text-to-image and image-to-image pipelines
- **API Endpoints**: Direct integration with HuggingFace inference API

---

## 📖 Documentation & Resources

### Comprehensive Documentation Suite
- 📋 **[Installation Guide](INSTALLATION.md)**: Complete setup with model placement diagrams
- 🛠️ **[Setup Guide](SETUP.md)**: Docker configuration and development environment
- 📙 **Training Logs**: Detailed training curves and hyperparameter configurations
- 📕 **Model Cards**: Individual documentation for each implemented model

---

## 🌸 Development

### Development Guidelines
Please refer to our detailed guides:
- **[INSTALLATION.md](INSTALLATION.md)**: Model setup and placement instructions
- **[SETUP.md](SETUP.md)**: Development environment configuration

### Model Integration
Our modular architecture allows easy integration of new computer vision models:
1. **Study the paper**: Understand architecture and training details
2. **Implement the model**: Follow our PyTorch Lightning template
3. **Train on Lightning.ai**: Use our established training infrastructure
4. **Integrate with Django**: Add web interface and API endpoints
5. **Document thoroughly**: Include training details and usage examples

---

## 📜 Attribution


### Original Paper Attributions
We gratefully acknowledge the original authors of all reproduced papers:
- DeOldify by Jason Antic et al.
- Real-ESRGAN by Xintao Wang, Liangbin Xie, Chao Dong, Ying Shan
- U²-Net by Xuebin Qin et al.
- AnimeGANv3 by Jie Chen, Gang Liu, Xin Chen
- Neural Style Transfer by Leon A. Gatys, Alexander S. Ecker, Matthias Bethge
- FLUX.1 by Black Forest Labs
- Segment Anything by Meta AI

---

<div align="center">
  <h2>🌟 Open Source Computer Vision Platform</h2>
  <p><em>Faithful eproduction of state-of-the-art research with practical deployment</em></p>
  
  <br>
  
  **Development Team**: [XBastille](https://github.com/XBastille) (Lead) • [Abhinab Choudhary](https://github.com/abhinab-choudhury) (Full-Stack) • [Soap-mac](https://github.com/Soap-mac) (Frontend)<br>
  **Training Infrastructure**: Lightning.ai A100 GPU Cluster<br>
  **Integration Platform**: HuggingFace Hub & APIs<br>
  
  
  **Quick Links**: [Installation](INSTALLATION.md) • [Setup](SETUP.md) 
  
  <a href="#top">⬆️ Back to Top</a>
</div>

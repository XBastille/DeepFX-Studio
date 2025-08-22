function openShowcase() {
    const showcaseContainer = document.getElementById('showcase-container');
    
    if (showcaseContainer) {
        gsap.timeline()
            .call(() => {
                showcaseContainer.style.display = 'block';
            })
            .fromTo(showcaseContainer,
                {
                    opacity: 0,
                    scale: 1.05,
                    filter: "blur(10px)"
                },
                {
                    duration: 0.8,
                    opacity: 1,
                    scale: 1,
                    filter: "blur(0px)",
                    ease: "power2.out"
                }
            )
            .call(() => {
                loadShowcaseContent();
            });
    }
}

function closeShowcase() {
    const showcaseContainer = document.getElementById('showcase-container');
    
    if (showcaseContainer) {
        gsap.timeline()
            .to(showcaseContainer, {
                duration: 0.6,
                opacity: 0,
                scale: 1.05,
                filter: "blur(5px)",
                ease: "power2.inOut"
            })
            .call(() => {
                showcaseContainer.style.display = 'none';
            });
    }
}

function loadShowcaseContent() {
    loadTextToImageContent();
    loadBackgroundRemoverContent();
    loadColorizationContent();
    loadFilterContent();
    loadEditorContent();
    loadUpscaleContent();
    loadArtisticContent();
}

function loadTextToImageContent() {
    const gallery = document.getElementById('txt2img-gallery');
    if (!gallery) return;

    const showcaseImages = [
        {
            id: 1,
            prompt: "A majestic phoenix rising from ethereal flames in a mystical forest, intricate feather details catching golden light, ancient trees with glowing runes, magical particles floating in the air, cinematic lighting, ultra-detailed, fantasy art style, 8k resolution, dramatic composition",
            seed: 42891705,
            width: 1024,
            height: 1024,
            guidance: 7.5,
            steps: 28,
            image: "/static/images/01.png"
        },
        {
            id: 2,
            prompt: "Cyberpunk samurai warrior in neon-lit Tokyo street, holographic katana blade, rain-soaked asphalt reflecting colorful signs, traditional armor with futuristic tech integration, cherry blossoms falling, atmospheric fog, blade runner aesthetic, highly detailed",
            seed: 78234561,
            width: 896,
            height: 1152,
            guidance: 8.0,
            steps: 32,
            image: "/static/images/02.png"
        },
        {
            id: 3,
            prompt: "Underwater palace of Atlantis with bioluminescent coral gardens, ancient Greek architecture merged with organic sea life, schools of tropical fish swimming through marble columns, rays of sunlight penetrating crystal-clear water, photorealistic",
            seed: 93847562,
            width: 896,
            height: 1152,
            guidance: 7.0,
            steps: 25,
            image: "/static/images/03.png"
        },
        {
            id: 4,
            prompt: "Steampunk airship floating above Victorian London at sunset, brass and copper mechanical details, billowing steam clouds, Big Ben visible below, intricate gears and clockwork mechanisms, warm golden hour lighting, concept art style",
            seed: 15673489,
            width: 832,
            height: 1216,
            guidance: 6.5,
            steps: 30,
            image: "/static/images/04.png"
        },
        {
            id: 5,
            prompt: "Enchanted library with floating books and glowing magical tomes, spiral staircases reaching impossible heights, aurora borealis visible through stained glass windows, ancient wizard's study, mystical atmosphere, fantasy illustration",
            seed: 67891234,
            width: 1024,
            height: 1024,
            guidance: 8.5,
            steps: 35,
            image: "/static/images/06.png"
        },
        {
            id: 6,
            prompt: "Alien jungle planet with bioluminescent flora, crystalline trees reaching toward twin moons, exotic creatures with iridescent scales, otherworldly landscape, sci-fi concept art, vivid colors, ultra-detailed environment",
            seed: 41259876,
            width: 768,
            height: 1344,
            guidance: 7.8,
            steps: 28,
            image: "/static/images/05.png"
        },
        {
            id: 7,
            prompt: "Medieval dragon perched on castle tower during thunderstorm, lightning illuminating massive wings, ancient stone architecture, dramatic storm clouds, epic fantasy scene, detailed scales and textures, cinematic composition",
            seed: 82743156,
            width: 1024,
            height: 1152,
            guidance: 9.0,
            steps: 40,
            image: "/static/images/07.png"
        },
        {
            id: 8,
            prompt: "Art nouveau portrait of elegant woman with flowing hair made of autumn leaves, intricate botanical patterns, golden ratio composition, warm earth tones, ornate decorative elements, alphonse mucha style, masterpiece quality",
            seed: 36789124,
            width: 832,
            height: 1216,
            guidance: 6.8,
            steps: 26,
            image: "/static/images/08.png"
        },
        {
            id: 9,
            prompt: "Futuristic space station orbiting a gas giant with spectacular ring system, advanced technology, sleek metallic surfaces, Earth-like planet visible in distance, sci-fi architecture, lens flares, photorealistic rendering",
            seed: 59123478,
            width: 896,
            height: 1152,
            guidance: 7.2,
            steps: 33,
            image: "/static/images/09.png"
        },
        {
            id: 10,
            prompt: "Serene Japanese garden in spring with cherry blossoms in full bloom, traditional wooden bridge over koi pond, stone lanterns, perfectly manicured landscape, soft morning light, peaceful atmosphere, high detail photography style",
            seed: 73456891,
            width: 768,
            height: 1024,
            guidance: 5.5,
            steps: 22,
            image: "/static/images/10.png"
        },
        {
            id: 11,
            prompt: "Abstract cosmic nebula with swirling galaxies and newborn stars, vibrant purples and blues, cosmic dust clouds, deep space astronomy, Hubble telescope style, infinite depth, stellar nursery, breathtaking space photography",
            seed: 91847356,
            width: 1024,
            height: 1024,
            guidance: 8.2,
            steps: 31,
            image: "/static/images/11.png"
        },
        {
            id: 13,
            prompt: "Magical fairy realm with luminescent mushrooms and tiny glowing sprites, dewdrops on spider webs, miniature fairy houses built into tree bark, enchanted forest floor, whimsical fantasy art, macro photography perspective, ethereal lighting",
            seed: 84623195,
            width: 1152,
            height: 1152,
            guidance: 6.0,
            steps: 24,
            image: "/static/images/12.png"
        }
    ];

    const processedImages = showcaseImages.map(img => {
        const aspectRatio = img.width / img.height;
        let gridClass = '';

        if (aspectRatio > 1.3) {
            gridClass = 'wide'; 
        } else if (aspectRatio < 0.7) {
            gridClass = 'tall'; 
        }

        return { ...img, gridClass };
    });

    gallery.innerHTML = processedImages.map(img => `
        <div class="showcase-image-item ${img.gridClass}" data-image='${JSON.stringify(img)}'>
            <div class="image-container">
                <img src="${img.image}" alt="Generated Image">
                <div class="image-overlay">
                    <div class="image-info">
                        <span class="image-seed">Seed: ${img.seed}</span>
                        <span class="image-dimensions">${img.width}×${img.height}</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    gallery.querySelectorAll('.showcase-image-item').forEach(item => {
        item.addEventListener('click', function () {
            const data = JSON.parse(this.dataset.image);
            openImageModal(data);
        });
    });

    if (typeof gsap !== 'undefined') {
        gsap.fromTo('.showcase-image-item',
            { opacity: 0, scale: 0.8, y: 20 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)",
                delay: 0.3
            }
        );
    }
}

function loadBackgroundRemoverContent() {
    const gallery = document.getElementById('bg-remover-gallery');
    if (!gallery) return;

    const bgRemoverExamples = [
        {
            id: 'bg1',
            type: 'background-remover',
            before: "/static/images/bg.jpg",
            after: "/static/images/bg_rem.png",
            parameters: {}
        },
        {
            id: 'bg2',
            type: 'background-remover',
            before: "/static/images/bg2.jpg",
            after: "/static/images/bg_rem2.png",
            parameters: {}
        },
        {
            id: 'bg3',
            type: 'background-remover',
            before: "/static/images/bg3.jpg",
            after: "/static/images/bg_rem3.png",
            parameters: {}
        },
        {
            id: 'bg4',
            type: 'background-remover',
            before: "/static/images/bg4.jpg",
            after: "/static/images/bg_rem4.png",
            parameters: {}
        }
    ];

    createSlideshowGallery(gallery, bgRemoverExamples);
}

function loadColorizationContent() {
    const gallery = document.getElementById('colorization-gallery');
    if (!gallery) return;

    const colorizationExamples = [
        {
            id: 'col1',
            type: 'colorization',
            before: "/static/images/bnw.jpg",
            after: "/static/images/colored.jpg",
            parameters: {
                render_factor: 35,
                artistic: false
            }
        },
        {
            id: 'col2',
            type: 'colorization',
            before: "/static/images/bnw2.jpg",
            after: "/static/images/colored2.jpg",
            parameters: {
                render_factor: 42,
                artistic: true
            }
        },
        {
            id: 'col3',
            type: 'colorization',
            before: "/static/images/bnw3.jpg",
            after: "/static/images/colored3.jpg",
            parameters: {
                render_factor: 28,
                artistic: false
            }
        },
        {
            id: 'col4',
            type: 'colorization',
            before: "/static/images/bnw4.jpg",
            after: "/static/images/colored4.jpg",
            parameters: {
                render_factor: 38,
                artistic: true
            }
        }
    ];

    createSlideshowGallery(gallery, colorizationExamples);
}

function loadFilterContent() {
    const gallery = document.getElementById('filter-gallery');
    if (!gallery) return;

    const filterExamples = [
        {
            id: 'filter1',
            type: 'filter',
            before: "/static/images/filter4.jpg",
            after: "/static/images/filtered4.webp",
            parameters: {
                Shinkai: true,
                JP_face: false,
                PortraitSketch: false,
                Paprika: false,
                Hayao: false,
                Arcane: false
            }
        },
        {
            id: 'filter2',
            type: 'filter',
            before: "/static/images/filter2.jpg",
            after: "/static/images/filtered2.jpg",
            parameters: {
                Shinkai: false,
                JP_face: true,
                PortraitSketch: false,
                Paprika: false,
                Hayao: false,
                Arcane: false
            }
        },
        {
            id: 'filter3',
            type: 'filter',
            before: "/static/images/filter.jpg",
            after: "/static/images/filtered.webp",
            parameters: {
                Shinkai: false,
                JP_face: false,
                PortraitSketch: false,
                Paprika: false,
                Hayao: true,
                Arcane: false
            }
        },
        {
            id: 'filter4',
            type: 'filter',
            before: "/static/images/filter3.jpg",
            after: "/static/images/filtered3.jpg",
            parameters: {
                Shinkai: false,
                JP_face: false,
                PortraitSketch: false,
                Paprika: false,
                Hayao: false,
                Arcane: true
            }
        }
    ];

    createSlideshowGallery(gallery, filterExamples);
}

function loadEditorContent() {
    const gallery = document.getElementById('editor-gallery');
    if (!gallery) return;

    const editorExamples = [
        {
            id: 'edit1',
            type: 'editor',
            before: "/static/images/edit.jpg",
            mask: "/static/images/mask.webp",
            after: "/static/images/output.jpg",
            operation: 'object_removal',
            parameters: {}
        },
        {
            id: 'edit2',
            type: 'editor',
            before: "/static/images/edit4.jpg",
            mask: "/static/images/mask4.webp",
            after: "/static/images/output4.jpg",
            operation: 'fill',
            parameters: {
                text_prompt: "Beautiful landscape with mountains",
                controlnet_scale: 0.9,
                guidance_scale: 7.5,
                num_inference_steps: 20,
                negative_prompt: "blurry, low quality",
                seed: 42
            }
        },
        {
            id: 'edit3',
            type: 'editor',
            before: "/static/images/edit3.jpg",
            mask: "/static/images/mask3.webp",
            after: "/static/images/output3.jpg",
            operation: 'replace',
            parameters: {
                text_prompt: "Modern sports car",
                controlnet_scale: 0.9,
                guidance_scale: 8.0,
                num_inference_steps: 25,
                negative_prompt: "distorted, ugly",
                seed: 123
            }
        },
        {
            id: 'edit4',
            type: 'editor',
            before: "/static/images/edit2.jpg",
            mask: "/static/images/mask2.webp",
            after: "/static/images/output2.jpg",
            operation: 'object_removal',
            parameters: {}
        }
    ];

    createTripleImageGallery(gallery, editorExamples);
}

function loadUpscaleContent() {
    const gallery = document.getElementById('upscale-gallery');
    if (!gallery) return;

    const upscaleExamples = [
        {
            id: 'up1',
            type: 'upscale',
            before: "/static/images/low.jpg",
            after: "/static/images/high.jpg",
            parameters: {
                scale_size: 4
            }
        },
        {
            id: 'up2',
            type: 'upscale',
            before: "/static/images/low2.jpg",
            after: "/static/images/high2.jpg",
            parameters: {
                scale_size: 2
            }
        },
        {
            id: 'up3',
            type: 'upscale',
            before: "/static/images/low3.jpg",
            after: "/static/images/high3.jpg",
            parameters: {
                scale_size: 4
            }
        },
        {
            id: 'up4',
            type: 'upscale',
            before: "/static/images/low4.jpg",
            after: "/static/images/high4.jpg",
            parameters: {
                scale_size: 2
            }
        }
    ];

    createSlideshowGallery(gallery, upscaleExamples);
}

function loadArtisticContent() {
    const gallery = document.getElementById('artistic-gallery');
    if (!gallery) return;

    const artisticExamples = [
        {
            id: 'art1',
            type: 'artistic',
            content: "/static/images/content.jpg",
            style: "/static/images/style.jpg",
            result: "/static/images/generated.jpg",
            parameters: {}
        },
        {
            id: 'art2',
            type: 'artistic',
            content: "/static/images/content2.jpg",
            style: "/static/images/style2.jpg",
            result: "/static/images/generated2.jpg",
            parameters: {}
        },
        {
            id: 'art3',
            type: 'artistic',
            content: "/static/images/content3.jpg",
            style: "/static/images/style3.jpg",
            result: "/static/images/generated3.jpg",
            parameters: {}
        },
        {
            id: 'art4',
            type: 'artistic',
            content: "/static/images/content4.jpg",
            style: "/static/images/style4.jpg",
            result: "/static/images/generated4.jpg",
            parameters: {}
        }
    ];

    createArtisticGallery(gallery, artisticExamples);
}

function createSlideshowGallery(gallery, examples) {
    gallery.innerHTML = examples.map((example, index) => `
        <div class="slideshow-image-item" onclick="openBeforeAfterModal('${example.id}')" data-example='${JSON.stringify(example)}' data-slideshow-index="${index}">
            <div class="slideshow-container">
                <img src="${example.before}" alt="Before" class="slideshow-image active" onload="adjustSlideshow(this)">
                <img src="${example.after}" alt="After" class="slideshow-image" onload="adjustSlideshow(this)">
                <div class="slideshow-indicator input">Input</div>
            </div>
        </div>
    `).join('');

    setTimeout(() => {
        const slideshowItems = gallery.querySelectorAll('.slideshow-image-item');
        slideshowItems.forEach((item, index) => {
            initializeSlideshow(item, index);
        });
    }, 100);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(gallery.querySelectorAll('.slideshow-image-item'),
            { opacity: 0, scale: 0.8, y: 20 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)",
                delay: 0.3
            }
        );
    }
}

function createTripleImageGallery(gallery, examples) {
    gallery.innerHTML = examples.map((example, index) => `
        <div class="slideshow-image-item" onclick="openTripleImageModal('${example.id}')" data-example='${JSON.stringify(example)}' data-slideshow-index="${index}">
            <div class="slideshow-container">
                <img src="${example.before}" alt="Input" class="slideshow-image active" onload="adjustSlideshow(this)">
                <img src="${example.mask}" alt="Mask" class="slideshow-image mask" onload="adjustSlideshow(this)">
                <img src="${example.after}" alt="Output" class="slideshow-image" onload="adjustSlideshow(this)">
                <div class="slideshow-indicator input">Input</div>
            </div>
        </div>
    `).join('');

    setTimeout(() => {
        const slideshowItems = gallery.querySelectorAll('.slideshow-image-item');
        slideshowItems.forEach((item, index) => {
            initializeTripleSlideshow(item, index);
        });
    }, 100);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(gallery.querySelectorAll('.slideshow-image-item'),
            { opacity: 0, scale: 0.8, y: 20 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)",
                delay: 0.3
            }
        );
    }
}

function createArtisticGallery(gallery, examples) {
    gallery.innerHTML = examples.map((example, index) => `
        <div class="artistic-item" onclick="openArtisticModal('${example.id}')" data-example='${JSON.stringify(example)}'>
            <div class="artistic-showcase-large">
                <div class="artistic-row">
                    <div class="artistic-image">
                        <img src="${example.content}" alt="Content">
                        <div class="artistic-label content">Content</div>
                    </div>
                    <div class="artistic-image">
                        <img src="${example.style}" alt="Style">
                        <div class="artistic-label style">Style</div>
                    </div>
                </div>
                <div class="artistic-image artistic-result-large">
                    <img src="${example.result}" alt="Result">
                    <div class="artistic-label result">Result</div>
                </div>
            </div>
        </div>
    `).join('');

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(gallery.querySelectorAll('.artistic-item'),
            { opacity: 0, scale: 0.8, y: 20 },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: "back.out(1.7)",
                delay: 0.3
            }
        );
    }
}

function initializeSlideshow(slideshowItem, itemIndex) {
    if (!slideshowItem) return;

    const images = slideshowItem.querySelectorAll('.slideshow-image');
    const indicator = slideshowItem.querySelector('.slideshow-indicator');
    const container = slideshowItem.querySelector('.slideshow-container');
    let currentIndex = 0;

    if (images[0] && images[0].complete) {
        container.style.height = images[0].offsetHeight + 'px';
    }

    const slideInterval = setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');

        if (images[currentIndex].complete) {
            container.style.height = images[currentIndex].offsetHeight + 'px';
        }

        indicator.textContent = currentIndex === 0 ? 'Input' : 'Output';
        indicator.className = `slideshow-indicator ${currentIndex === 0 ? 'input' : 'output'}`;
    }, 3000);

    slideshowItem.slideInterval = slideInterval;
}

function initializeTripleSlideshow(slideshowItem, itemIndex) {
    if (!slideshowItem) return;

    const images = slideshowItem.querySelectorAll('.slideshow-image');
    const indicator = slideshowItem.querySelector('.slideshow-indicator');
    const container = slideshowItem.querySelector('.slideshow-container');
    let currentIndex = 0;

    if (images[0] && images[0].complete) {
        container.style.height = images[0].offsetHeight + 'px';
    }

    const slideInterval = setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');

        if (images[currentIndex].complete) {
            container.style.height = images[currentIndex].offsetHeight + 'px';
        }

        const labels = ['Input', 'Mask', 'Output'];
        const classes = ['input', 'mask', 'output'];
        indicator.textContent = labels[currentIndex];
        indicator.className = `slideshow-indicator ${classes[currentIndex]}`;
    }, 2500); 

    slideshowItem.slideInterval = slideInterval;
}

function adjustSlideshow(img) {
    const container = img.closest('.slideshow-container');
    if (container && img.classList.contains('active')) {
        container.style.height = img.offsetHeight + 'px';
    }
}

function openImageModal(data) {
    const modal = document.getElementById('image-modal');
    const modalContent = modal.querySelector('.modal-content');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = document.getElementById('modal-body-content');

    modalContent.classList.remove('dual-image-modal', 'triple-image-modal', 'artistic-modal');

    modalTitle.textContent = 'Generation Details';

    modalBody.innerHTML = `
        <div class="modal-image-section">
            <div class="modal-image-container">
                <img src="${data.image}" alt="Generated Image">
            </div>
        </div>
        <div class="modal-info-section">
            <div class="modal-parameters">
                <h4>Generation Parameters</h4>
                <div class="parameter-grid">
                    <div class="parameter-item">
                        <span class="param-label">Seed</span>
                        <span class="param-value">${data.seed}</span>
                    </div>
                    <div class="parameter-item">
                        <span class="param-label">Dimensions</span>
                        <span class="param-value">${data.width} × ${data.height}</span>
                    </div>
                    <div class="parameter-item">
                        <span class="param-label">Guidance Scale</span>
                        <span class="param-value">${data.guidance}</span>
                    </div>
                    <div class="parameter-item">
                        <span class="param-label">Inference Steps</span>
                        <span class="param-value">${data.steps}</span>
                    </div>
                </div>
            </div>
            <div class="prompt-section">
                <div class="prompt-header">
                    <h5>Prompt</h5>
                    <button class="copy-btn" onclick="copyPrompt()">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"></path>
                        </svg>
                        <span>Copy</span>
                    </button>
                </div>
                <p id="param-prompt" class="prompt-text">${data.prompt}</p>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modalContent,
            { opacity: 0, scale: 0.8, y: 50 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

function openBeforeAfterModal(exampleId) {
    const exampleData = document.querySelector(`[data-example*='"id":"${exampleId}"']`).dataset.example;
    const data = JSON.parse(exampleData);

    const modal = document.getElementById('image-modal');
    const modalContent = modal.querySelector('.modal-content');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = document.getElementById('modal-body-content');

    modalContent.classList.add('dual-image-modal');

    const typeNames = {
        'background-remover': 'Background Removal',
        'colorization': 'AI Colorization',
        'filter': 'AI Filter',
        'editor': 'AI Image Editor',
        'upscale': 'Image Upscale',
        'artistic': 'Artistic Creator'
    };
    modalTitle.textContent = typeNames[data.type] || 'AI Processing';

    modalBody.innerHTML = `
        <div class="modal-before-section">
            <h4>Before</h4>
            <div class="modal-image-container before-after">
                <img src="${data.before}" alt="Before">
            </div>
        </div>
        <div class="modal-after-section">
            <h4>After</h4>
            <div class="modal-image-container before-after">
                <img src="${data.after}" alt="After">
            </div>
        </div>
        <div class="modal-info-section">
            ${generateParametersHTML(data)}
        </div>
    `;

    modal.style.display = 'flex';
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modalContent,
            { opacity: 0, scale: 0.8, y: 50 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

function openTripleImageModal(exampleId) {
    const exampleData = document.querySelector(`[data-example*='"id":"${exampleId}"']`).dataset.example;
    const data = JSON.parse(exampleData);

    const modal = document.getElementById('image-modal');
    const modalContent = modal.querySelector('.modal-content');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = document.getElementById('modal-body-content');

    modalContent.classList.remove('dual-image-modal', 'artistic-modal');
    modalContent.classList.add('triple-image-modal');

    modalTitle.textContent = 'AI Image Editor - Inpainting';

    modalBody.innerHTML = `
        <div class="modal-before-section">
            <h4>Input</h4>
            <div class="modal-image-container before-after">
                <img src="${data.before}" alt="Input">
            </div>
        </div>
        <div class="modal-mask-section">
            <h4>Mask</h4>
            <div class="modal-image-container before-after">
                <img src="${data.mask}" alt="Mask">
            </div>
        </div>
        <div class="modal-after-section">
            <h4>Output</h4>
            <div class="modal-image-container before-after">
                <img src="${data.after}" alt="Output">
            </div>
        </div>
        <div class="modal-info-section">
            ${generateParametersHTML(data)}
        </div>
    `;

    modal.style.display = 'flex';
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modalContent,
            { opacity: 0, scale: 0.8, y: 50 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

function openArtisticModal(exampleId) {
    const exampleData = document.querySelector(`[data-example*='"id":"${exampleId}"']`).dataset.example;
    const data = JSON.parse(exampleData);

    const modal = document.getElementById('image-modal');
    const modalContent = modal.querySelector('.modal-content');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = document.getElementById('modal-body-content');

    modalContent.classList.remove('dual-image-modal', 'artistic-modal-compact');
    modalContent.classList.add('triple-image-modal');
    modalContent.setAttribute('data-modal-type', 'artistic'); 

    modalTitle.textContent = 'Artistic Image Creator - Style Transfer';

    modalBody.innerHTML = `
        <div class="modal-before-section">
            <h4>Content</h4>
            <div class="modal-image-container before-after">
                <img src="${data.content}" alt="Content">
            </div>
        </div>
        <div class="modal-mask-section">
            <h4>Style</h4>
            <div class="modal-image-container before-after">
                <img src="${data.style}" alt="Style">
            </div>
        </div>
        <div class="modal-after-section">
            <h4>Result</h4>
            <div class="modal-image-container before-after">
                <img src="${data.result}" alt="Result">
            </div>
        </div>
        <div class="modal-info-section">
            ${generateParametersHTML(data)}
        </div>
    `;

    modal.style.display = 'flex';
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modalContent,
            { opacity: 0, scale: 0.8, y: 50 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

function generateParametersHTML(data) {
    if (data.type === 'background-remover' || data.type === 'artistic') {
        return '<div class="modal-parameters"><h4>Processing Parameters</h4><p style="color: rgba(255,255,255,0.7); padding: 1rem; text-align: center;"></p></div>';
    }

    let parametersHTML = '<div class="modal-parameters"><h4>Processing Parameters</h4><div class="parameter-grid">';

    if (data.type === 'colorization') {
        parametersHTML += `
            <div class="parameter-item">
                <span class="param-label">Render Factor</span>
                <span class="param-value">${data.parameters.render_factor}</span>
            </div>
            <div class="parameter-item">
                <span class="param-label">Artistic Mode</span>
                <span class="param-value">${data.parameters.artistic ? 'Yes' : 'No'}</span>
            </div>
        `;
    } else if (data.type === 'filter') {
        Object.entries(data.parameters).forEach(([key, value]) => {
            if (value) {
                parametersHTML += `
                    <div class="parameter-item">
                        <span class="param-label">Active Filter</span>
                        <span class="param-value">${key}</span>
                    </div>
                `;
            }
        });
    } else if (data.type === 'editor') {
        if (data.operation === 'object_removal') {
            parametersHTML += `
                <div class="parameter-item">
                    <span class="param-label">Operation</span>
                    <span class="param-value">Object Removal</span>
                </div>
            `;
        } else {
            Object.entries(data.parameters).forEach(([key, value]) => {
                parametersHTML += `
                    <div class="parameter-item">
                        <span class="param-label">${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                        <span class="param-value">${value}</span>
                    </div>
                `;
            });
        }
    } else if (data.type === 'upscale') {
        parametersHTML += `
            <div class="parameter-item">
                <span class="param-label">Scale Size</span>
                <span class="param-value">${data.parameters.scale_size}x</span>
            </div>
        `;
    }

    parametersHTML += '</div></div>';
    return parametersHTML;
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    const modalContent = modal.querySelector('.modal-content');

    if (typeof gsap !== 'undefined') {
        gsap.to(modalContent, {
            opacity: 0,
            scale: 0.8,
            y: 50,
            duration: 0.3,
            ease: "power2.inOut",
            onComplete: () => {
                modal.style.display = 'none';
                modalContent.classList.remove('dual-image-modal', 'triple-image-modal', 'artistic-modal', 'artistic-modal-compact');
                modalContent.removeAttribute('data-modal-type');
            }
        });
    } else {
        modal.style.display = 'none';
        modalContent.classList.remove('dual-image-modal', 'triple-image-modal', 'artistic-modal', 'artistic-modal-compact');
        modalContent.removeAttribute('data-modal-type');
    }
}

function copyPrompt() {
    const promptText = document.getElementById('param-prompt');
    if (promptText && promptText.textContent && promptText.textContent !== '-') {
        navigator.clipboard.writeText(promptText.textContent).then(() => {
            const copyBtn = document.querySelector('.copy-btn span');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';

                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }
        }).catch(err => {
            console.error('Failed to copy: ', err);
            const textArea = document.createElement('textarea');
            textArea.value = promptText.textContent;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);

            const copyBtn = document.querySelector('.copy-btn span');
            if (copyBtn) {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                setTimeout(() => {
                    copyBtn.textContent = originalText;
                }, 2000);
            }
        });
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        const modal = document.getElementById('image-modal');
        const showcase = document.getElementById('showcase-container');
        
        if (modal && modal.style.display === 'flex') {
            closeImageModal();
        } else if (showcase && showcase.style.display !== 'none') {
            closeShowcase();
        }
    }
});

window.openShowcase = openShowcase;
window.closeShowcase = closeShowcase;
window.openImageModal = openImageModal;
window.closeImageModal = closeImageModal;
window.openBeforeAfterModal = openBeforeAfterModal;
window.openTripleImageModal = openTripleImageModal;
window.openArtisticModal = openArtisticModal;
window.copyPrompt = copyPrompt;
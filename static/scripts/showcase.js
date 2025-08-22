// AI Gallery Showcase JavaScript - Landing Page Version

// Global variables
let currentImageModalData = null;

// Main showcase functions
function openShowcase() {
    const showcaseContainer = document.getElementById('showcase-container');
    const body = document.body;
    
    if (!showcaseContainer) return;
    
    // Prevent scrolling on body
    body.style.overflow = 'hidden';
    
    // Show the showcase container
    showcaseContainer.style.display = 'block';
    
    // Smooth animation using GSAP if available, otherwise fallback to CSS
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(showcaseContainer,
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
                ease: "power2.out",
                onComplete: () => {
                    loadShowcaseContent();
                }
            }
        );
    } else {
        // CSS fallback
        showcaseContainer.style.opacity = '0';
        showcaseContainer.style.transform = 'scale(1.05)';
        showcaseContainer.style.filter = 'blur(10px)';
        
        setTimeout(() => {
            showcaseContainer.style.transition = 'all 0.8s ease';
            showcaseContainer.style.opacity = '1';
            showcaseContainer.style.transform = 'scale(1)';
            showcaseContainer.style.filter = 'blur(0px)';
            loadShowcaseContent();
        }, 50);
    }
}

function closeShowcase() {
    const showcaseContainer = document.getElementById('showcase-container');
    const body = document.body;
    
    if (!showcaseContainer) return;
    
    // Restore body scrolling
    body.style.overflow = '';
    
    // Smooth animation using GSAP if available, otherwise fallback to CSS
    if (typeof gsap !== 'undefined') {
        gsap.to(showcaseContainer, {
            duration: 0.6,
            opacity: 0,
            scale: 1.05,
            filter: "blur(5px)",
            ease: "power2.inOut",
            onComplete: () => {
                showcaseContainer.style.display = 'none';
            }
        });
    } else {
        // CSS fallback
        showcaseContainer.style.transition = 'all 0.6s ease';
        showcaseContainer.style.opacity = '0';
        showcaseContainer.style.transform = 'scale(1.05)';
        showcaseContainer.style.filter = 'blur(5px)';
        
        setTimeout(() => {
            showcaseContainer.style.display = 'none';
        }, 600);
    }
}

// Load all showcase content
function loadShowcaseContent() {
    loadTextToImageContent();
    loadBackgroundRemoverContent();
    loadColorizationContent();
    loadFilterContent();
    loadEditorContent();
    loadUpscaleContent();
    loadArtisticContent();
}

// Load Text-to-Image content
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
                <img src="${img.image}" alt="Generated Image" loading="lazy">
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

    // Animate items if GSAP is available
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

// Load Background Remover content
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

// Load Colorization content
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

// Load Filter content
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

// Load Editor content
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

    createSlideshowGallery(gallery, editorExamples);
}

// Load Upscale content
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

// Load Artistic content
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

    // Create artistic gallery (different from slideshow)
    gallery.innerHTML = artisticExamples.map(example => `
        <div class="artistic-image-item" data-example='${JSON.stringify(example)}'>
            <div class="artistic-container">
                <div class="artistic-images">
                    <div class="artistic-input">
                        <img src="${example.content}" alt="Content Image" loading="lazy">
                        <span class="artistic-label">Content</span>
                    </div>
                    <div class="artistic-style">
                        <img src="${example.style}" alt="Style Image" loading="lazy">
                        <span class="artistic-label">Style</span>
                    </div>
                    <div class="artistic-result">
                        <img src="${example.result}" alt="Result Image" loading="lazy">
                        <span class="artistic-label">Result</span>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // Add click events for artistic items
    gallery.querySelectorAll('.artistic-image-item').forEach(item => {
        item.addEventListener('click', function () {
            const data = JSON.parse(this.dataset.example);
            openBeforeAfterModal(data.id);
        });
    });

    // Animate items if GSAP is available
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(gallery.querySelectorAll('.artistic-image-item'),
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

// Create slideshow gallery
function createSlideshowGallery(gallery, examples) {
    gallery.innerHTML = examples.map((example, index) => `
        <div class="slideshow-image-item" data-example='${JSON.stringify(example)}' data-slideshow-index="${index}">
            <div class="slideshow-container">
                <img src="${example.before}" alt="Before" class="slideshow-image active" loading="lazy">
                <img src="${example.after}" alt="After" class="slideshow-image" loading="lazy">
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

    // Animate items if GSAP is available
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

    // Add click events for slideshow items
    gallery.querySelectorAll('.slideshow-image-item').forEach(item => {
        item.addEventListener('click', function () {
            const data = JSON.parse(this.dataset.example);
            openBeforeAfterModal(data.id);
        });
    });
}

// Initialize slideshow for individual items
function initializeSlideshow(slideshowItem, itemIndex) {
    if (!slideshowItem) return;

    const images = slideshowItem.querySelectorAll('.slideshow-image');
    const indicator = slideshowItem.querySelector('.slideshow-indicator');
    const container = slideshowItem.querySelector('.slideshow-container');
    let currentIndex = 0;

    // Set initial height
    if (images[0] && images[0].complete) {
        container.style.height = images[0].offsetHeight + 'px';
    }

    // Start slideshow interval
    const slideInterval = setInterval(() => {
        images[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % images.length;
        images[currentIndex].classList.add('active');

        // Update height if needed
        if (images[currentIndex].complete) {
            container.style.height = images[currentIndex].offsetHeight + 'px';
        }

        // Update indicator
        indicator.textContent = currentIndex === 0 ? 'Input' : 'Output';
        indicator.className = `slideshow-indicator ${currentIndex === 0 ? 'input' : 'output'}`;
    }, 3000);

    // Store interval reference for cleanup
    slideshowItem.slideInterval = slideInterval;
}

// Image modal functions
function openImageModal(imageData) {
    currentImageModalData = imageData;
    
    // Create modal if it doesn't exist
    let modal = document.getElementById('image-modal');
    if (!modal) {
        modal = createImageModal();
        document.body.appendChild(modal);
    }

    // Populate modal with data
    const modalTitle = modal.querySelector('.modal-title');
    const modalImage = modal.querySelector('.modal-image-container img');
    const promptText = modal.querySelector('.prompt-text');
    const parameterGrid = modal.querySelector('.parameter-grid');

    modalTitle.textContent = `Generated Image #${imageData.id}`;
    modalImage.src = imageData.image;
    modalImage.alt = 'Generated Image';
    
    if (promptText) {
        promptText.textContent = imageData.prompt;
    }

    if (parameterGrid) {
        parameterGrid.innerHTML = `
            <div class="parameter-item">
                <span class="param-label">Seed</span>
                <span class="param-value">${imageData.seed}</span>
            </div>
            <div class="parameter-item">
                <span class="param-label">Dimensions</span>
                <span class="param-value">${imageData.width}×${imageData.height}</span>
            </div>
            <div class="parameter-item">
                <span class="param-label">Guidance Scale</span>
                <span class="param-value">${imageData.guidance}</span>
            </div>
            <div class="parameter-item">
                <span class="param-label">Steps</span>
                <span class="param-value">${imageData.steps}</span>
            </div>
        `;
    }

    // Show modal
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';

    // Animate modal if GSAP is available
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modal,
            { opacity: 0 },
            { duration: 0.3, opacity: 1, ease: "power2.out" }
        );
        gsap.fromTo(modal.querySelector('.modal-content'),
            { scale: 0.8, y: 50 },
            { duration: 0.4, scale: 1, y: 0, ease: "back.out(1.7)", delay: 0.1 }
        );
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (!modal) return;

    document.body.style.overflow = '';

    if (typeof gsap !== 'undefined') {
        gsap.to(modal, {
            duration: 0.3,
            opacity: 0,
            ease: "power2.in",
            onComplete: () => {
                modal.style.display = 'none';
            }
        });
    } else {
        modal.style.display = 'none';
    }
}

function openBeforeAfterModal(exampleId) {
    const exampleData = document.querySelector(`[data-example*='"id":"${exampleId}"']`);
    if (!exampleData) return;
    
    const data = JSON.parse(exampleData.dataset.example);

    let modal = document.getElementById('image-modal');
    if (!modal) {
        modal = createImageModal();
        document.body.appendChild(modal);
    }

    const modalContent = modal.querySelector('.modal-content');
    const modalTitle = modal.querySelector('.modal-title');
    const modalBody = modal.querySelector('.modal-body');

    // Clear existing classes and add dual-image-modal class
    modalContent.classList.remove('triple-image-modal', 'artistic-modal');
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
    document.body.style.overflow = 'hidden';
    
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(modalContent,
            { opacity: 0, scale: 0.8, y: 50 },
            { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
        );
    }
}

function generateParametersHTML(data) {
    if (data.type === 'background-remover' || data.type === 'artistic') {
        return '<div class="modal-parameters"><h4>Processing Parameters</h4><p style="color: rgba(255,255,255,0.7); padding: 1rem; text-align: center;">No additional parameters required for this processing type.</p></div>';
    }

    let parametersHTML = '<div class="modal-parameters"><h4>Processing Parameters</h4><div class="parameter-grid">';

    if (data.type === 'colorization') {
        parametersHTML += `
            <div class="parameter-item">
                <span class="param-label">Render Factor</span>
                <span class="param-value">${data.parameters.render_factor || 'N/A'}</span>
            </div>
            <div class="parameter-item">
                <span class="param-label">Artistic Mode</span>
                <span class="param-value">${data.parameters.artistic ? 'Yes' : 'No'}</span>
            </div>
        `;
    } else if (data.type === 'filter') {
        const filters = ['Shinkai', 'JP_face', 'PortraitSketch', 'Paprika', 'Hayao', 'Arcane'];
        const activeFilter = filters.find(filter => data.parameters[filter]);
        parametersHTML += `
            <div class="parameter-item">
                <span class="param-label">Applied Filter</span>
                <span class="param-value">${activeFilter || 'Default'}</span>
            </div>
        `;
    } else if (data.type === 'upscale') {
        parametersHTML += `
            <div class="parameter-item">
                <span class="param-label">Scale Factor</span>
                <span class="param-value">${data.parameters.scale_size || 'N/A'}x</span>
            </div>
        `;
    } else if (data.type === 'editor') {
        parametersHTML += `
            <div class="parameter-item">
                <span class="param-label">Operation</span>
                <span class="param-value">${data.operation || 'N/A'}</span>
            </div>
        `;
        if (data.parameters.text_prompt) {
            parametersHTML += `
                <div class="parameter-item">
                    <span class="param-label">Text Prompt</span>
                    <span class="param-value">${data.parameters.text_prompt}</span>
                </div>
                <div class="parameter-item">
                    <span class="param-label">Guidance Scale</span>
                    <span class="param-value">${data.parameters.guidance_scale}</span>
                </div>
                <div class="parameter-item">
                    <span class="param-label">Steps</span>
                    <span class="param-value">${data.parameters.num_inference_steps}</span>
                </div>
            `;
        }
    }

    parametersHTML += '</div></div>';
    return parametersHTML;
}

// Create image modal HTML
function createImageModal() {
    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.className = 'image-modal';
    modal.style.display = 'none';

    modal.innerHTML = `
        <div class="modal-backdrop" onclick="closeImageModal()"></div>
        <div class="modal-content">
            <div class="modal-header">
                <h3 class="modal-title">Generated Image</h3>
                <button class="modal-close" onclick="closeImageModal()">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <div class="modal-body">
                <div class="modal-image-section">
                    <div class="modal-image-container">
                        <img src="" alt="Generated Image" loading="lazy">
                    </div>
                </div>
                <div class="modal-info-section">
                    <div class="modal-parameters">
                        <h4>Generation Parameters</h4>
                        <div class="parameter-grid">
                            <!-- Parameters will be populated dynamically -->
                        </div>
                    </div>
                    <div class="prompt-section">
                        <div class="prompt-header">
                            <h5>Prompt</h5>
                            <button class="copy-btn" onclick="copyPromptToClipboard()">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                </svg>
                                Copy
                            </button>
                        </div>
                        <div class="prompt-text">
                            <!-- Prompt will be populated dynamically -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    return modal;
}

// Copy prompt to clipboard
function copyPromptToClipboard() {
    if (!currentImageModalData) return;

    const prompt = currentImageModalData.prompt;
    
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(prompt).then(() => {
            showCopySuccessMessage();
        }).catch(() => {
            fallbackCopyToClipboard(prompt);
        });
    } else {
        fallbackCopyToClipboard(prompt);
    }
}

// Fallback copy method
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        showCopySuccessMessage();
    } catch (err) {
        console.error('Failed to copy text: ', err);
    }
    
    document.body.removeChild(textArea);
}

// Show copy success message
function showCopySuccessMessage() {
    const copyBtn = document.querySelector('.copy-btn');
    if (!copyBtn) return;

    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <polyline points="20,6 9,17 4,12"></polyline>
        </svg>
        Copied!
    `;
    copyBtn.style.color = '#22c55e';

    setTimeout(() => {
        copyBtn.innerHTML = originalText;
        copyBtn.style.color = '';
    }, 2000);
}

// Handle ESC key to close modals
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const imageModal = document.getElementById('image-modal');
        const showcaseContainer = document.getElementById('showcase-container');
        
        if (imageModal && imageModal.style.display !== 'none') {
            closeImageModal();
        } else if (showcaseContainer && showcaseContainer.style.display !== 'none') {
            closeShowcase();
        }
    }
});

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Showcase functionality initialized');
});
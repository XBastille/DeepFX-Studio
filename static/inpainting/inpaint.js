const dragAndDrop = document.querySelector('.drag-and-drop');
const fileInput = document.querySelector('.file-input');
const msg = document.querySelector('.drag-drop-msg');
const icon = document.querySelector('.content i');
const slide = document.querySelector('.slide');
const container = document.querySelector('.container');
const closeIcon = document.querySelector('.close-icon');
const imagePreview = document.querySelector('.image-preview');
const popupBox = document.querySelector('.popup-box');
const body = document.querySelector('body');
const popup = document.querySelector('.popup');
const sam = document.querySelector('.sam');
const mannual = document.querySelector('.mannual');
const paintOption = document.querySelector('.paint-options');

const imageCanvas = document.getElementById('imageCanvas');
const drawingCanvas = document.getElementById('drawingCanvas');
const maskPreview = document.getElementById('maskPreview');

const imageContext = imageCanvas.getContext('2d');
const drawingContext = drawingCanvas.getContext('2d');
const maskContext = maskPreview.getContext('2d');

const brush = document.querySelector("#brush");
const eraser = document.querySelector("#eraser");
const sizeInput = document.querySelector(".selector input");
const submit = document.querySelector(".submit");
const configHeader = document.getElementById('configHeader');
const arrow = document.getElementById('arrow');
const content = document.getElementById('configContent');
const resetBtn = document.getElementById('resetBtn');
const dropdownToggle = document.querySelector('.dropdown-toggle');
const submitDropdown = document.querySelector('.submit-dropdown');
let selectedType = 'fill';

dropdownToggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dropdownToggle.classList.toggle('active');
    submitDropdown.classList.toggle('show');
});

document.querySelectorAll('.dropdown-item').forEach(item => {
    if (item.dataset.type === selectedType) {
        item.classList.add('selected');
    }

    item.addEventListener('click', () => {
        selectedType = item.dataset.type;
        document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
        item.classList.add('selected');
        submitDropdown.classList.remove('show');
        dropdownToggle.classList.remove('active');
    });
});

document.addEventListener('click', () => {
    submitDropdown.classList.remove('show');
    dropdownToggle.classList.remove('active');
});


async function generateMaskWithSAM(imageData, coords) {
    try {
        const response = await fetch('/ai_image_editor/api/generate-mask/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: imageData,
                coords: coords
            })
        });
        return await response.json();
    } catch (error) {
        console.error('Error generating mask:', error);
    }
}

async function processImage(operation, imageData, maskData, prompt, config = null) {
    try {
        const requestBody = {
            operation: operation,
            image: imageData,
            mask: maskData,
            session_id: currentSessionId
        };

        if (operation === 'fill') {
            requestBody.prompt = prompt;
            requestBody.inference_steps = config.inference_steps;
            requestBody.guidance_scale = config.guidance_scale;
            requestBody.controlnet_scale = config.controlnet_scale;
            requestBody.seed = config.seed;
            requestBody.negative_prompt = config.negative_prompt;
        }

        const response = await fetch('/ai_image_editor/api/process-image/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });
        return await response.json();
    } catch (error) {
        console.error('Error processing image:', error);
    }
}

function createProcessingAnimation() {
    const container = document.createElement('div');
    container.className = 'processing-container';
    container.style.display = 'flex';

    const waveContainer = document.createElement('div');
    waveContainer.className = 'container';
    
    const screenWidth = window.innerWidth;
    if (screenWidth <= 480) {
        waveContainer.style.width = '180px';
        waveContainer.style.height = '180px';
    } else if (screenWidth <= 768) {
        waveContainer.style.width = '220px';
        waveContainer.style.height = '220px';
    } else {
        waveContainer.style.width = '280px';
        waveContainer.style.height = '280px';
    }

    for (let i = 0; i < 4; i++) {
        const wave = document.createElement('div');
        wave.className = 'wave';
        if (i > 0) wave.setAttribute('data-level', i);

        for (let j = 0; j < 24; j++) {
            const bar = document.createElement('div');
            bar.className = 'bar';
            wave.appendChild(bar);
        }
        waveContainer.appendChild(wave);
    }

    const text = document.createElement('p');
    text.className = 'processing-text';
    text.textContent = 'Processing image...';

    container.appendChild(waveContainer);
    container.appendChild(text);
    return container;
}

let currentSessionId = null;

document.querySelectorAll('.action-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
        if (!currentSessionId) {
            console.error('No session ID found');
            return;
        }

        const operation = btn.textContent.toLowerCase().includes('fill') ? 'fill' : 'remove';
        const originalContent = operation === 'remove' ?
            'Remove<i class="fa-solid fa-eraser"></i>' :
            'Fill or Replace<i class="fa-solid fa-fill"></i>';

        btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
        btn.disabled = true;

        const finalContainer = document.querySelector('.final-container');
        finalContainer.style.display = 'block';

        const finalDiv = document.querySelector('.final');
        finalDiv.innerHTML = '';
        finalDiv.appendChild(createProcessingAnimation());

        const imageData = imageCanvas.toDataURL();
        const maskData = maskPreview.toDataURL();

        let result;
        try {
            if (operation === 'fill') {
                const prompt = document.querySelector('.prompt input').value;
                const config = {
                    inference_steps: document.getElementById('inferenceStepsInput').value,
                    guidance_scale: document.getElementById('guidanceScaleInput').value,
                    controlnet_scale: document.getElementById('controlNetScaleInput').value,
                    seed: document.getElementById('seed').value,
                    negative_prompt: document.getElementById('negativePrompt').value
                };
                result = await processImage(operation, imageData, maskData, prompt, config);
            } else {
                result = await processImage('remove', imageData, maskData);
            }

            if (result && result.status === 'success') {
                const resultImg = document.createElement('img');
                resultImg.src = result.result;
                resultImg.style.width = 'auto';
                resultImg.style.height = 'auto';
                resultImg.style.maxWidth = '100%';
                resultImg.style.maxHeight = '100%';
                resultImg.style.objectFit = 'contain';
                finalDiv.innerHTML = '';
                finalDiv.appendChild(resultImg);
                const reuseBtn = document.querySelector('.reuse-btn');
                reuseBtn.style.display = 'block';
            }
        } catch (error) {
            console.error('Processing error:', error);
        } finally {
            btn.innerHTML = originalContent;
            btn.disabled = false;
        }
    });
});


document.querySelector('.reuse-btn').addEventListener('click', () => {
    const resultImg = document.querySelector('.final img');
    if (resultImg) {
        fetch(resultImg.src)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], 'reused-image.png', { type: 'image/png' });
                preview(file);

                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                fileInput.files = dataTransfer.files;
            });
    }
});
document.getElementById('diceBtn').addEventListener('click', () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    document.getElementById('seed').value = randomSeed;
});

function updateSliderTrack(slider, value) {
    const min = slider.min;
    const max = slider.max;
    const percentage = ((value - min) / (max - min)) * 100;
    slider.style.setProperty('--value-percent', `${percentage}%`);
}

const pairs = [
    {
        slider: document.getElementById('inferenceSteps'),
        input: document.getElementById('inferenceStepsInput'),
        defaultValue: 25
    },
    {
        slider: document.getElementById('guidanceScale'),
        input: document.getElementById('guidanceScaleInput'),
        defaultValue: 7.5
    },
    {
        slider: document.getElementById('controlNetScale'),
        input: document.getElementById('controlNetScaleInput'),
        defaultValue: 1.0
    }
];


configHeader.addEventListener('click', () => {
    content.classList.toggle('hidden');
    arrow.classList.toggle('collapsed');
});

pairs.forEach(pair => {
    const updateSliderBackground = (value) => {
        const min = pair.slider.min;
        const max = pair.slider.max;
        const percentage = ((value - min) / (max - min)) * 100;
        pair.slider.style.setProperty('--value-percent', `${percentage}%`);
    };

    pair.slider.addEventListener('input', () => {
        pair.input.value = pair.slider.value;
        updateSliderBackground(pair.slider.value);
    });

    pair.input.addEventListener('input', () => {
        pair.slider.value = pair.input.value;
        updateSliderBackground(pair.input.value);
    });

    updateSliderBackground(pair.slider.value);
});

resetBtn.addEventListener('click', () => {
    pairs.forEach(pair => {
        pair.slider.value = pair.defaultValue;
        pair.input.value = pair.defaultValue;
        updateSliderTrack(pair.slider, pair.defaultValue);
    });
    document.getElementById('seed').value = '';
    document.getElementById('negativePrompt').value = '';
});

let isDrawing = false;
let isErasing = false;
let isMobile = window.innerWidth <= 480;

const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

dragAndDrop.addEventListener('click', () => {
    drawingCanvas.style.display = 'block';
    imageCanvas.style.display = 'block';
    fileInput.click();
});

dragAndDrop.addEventListener('dragover', (e) => {
    e.preventDefault();
    dragAndDrop.style.border = '2px dashed white';
    msg.innerHTML = 'Release the image to upload';
});

dragAndDrop.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dragAndDrop.style.border = '2px solid white';
    msg.innerHTML = 'Drop Image Here or Click to Upload';
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
        preview(file);
        fileInput.disabled = true;
    }
});

dragAndDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    icon.style.display = 'none';
    msg.style.display = 'none';
    fileInput.files = e.dataTransfer.files;
    const file = e.dataTransfer.files[0];
    if (file) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
        preview(file);
    }
});

closeIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    resetPreview();
    fileInput.disabled = false;
});

function setCanvasSizes() {
    const width = dragAndDrop.offsetWidth;
    const height = dragAndDrop.offsetHeight;

    imageCanvas.width = width;
    imageCanvas.height = height;
    drawingCanvas.width = width;
    drawingCanvas.height = height;
    maskPreview.width = width;
    maskPreview.height = height;
}
setCanvasSizes();

addDrawingEvents();

drawingContext.lineWidth = 50;
drawingContext.strokeStyle = "white";
drawingContext.lineCap = "round";
drawingContext.globalCompositeOperation = "source-over";

function addDrawingEvents() {
    drawingCanvas.addEventListener('mousedown', handleStart);
    drawingCanvas.addEventListener('mousemove', handleMove);
    drawingCanvas.addEventListener('mouseup', handleEnd);
    drawingCanvas.addEventListener('mouseleave', handleEnd);
    
    if (isTouchDevice) {
        drawingCanvas.addEventListener('touchstart', handleStart, { passive: false });
        drawingCanvas.addEventListener('touchmove', handleMove, { passive: false });
        drawingCanvas.addEventListener('touchend', handleEnd, { passive: false });
        drawingCanvas.addEventListener('touchcancel', handleEnd, { passive: false });
    }
}

function getEventPos(e) {
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    
    let clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function handleStart(e) {
    if (e.touches && e.touches.length > 1) {
        isDrawing = false;
        return;
    }
    
    if (e.target === drawingCanvas) {
        e.preventDefault(); 
    }
    isDrawing = true;
    drawingContext.strokeStyle = "white";
    
    const pos = getEventPos(e);
    drawingContext.beginPath();
    drawingContext.moveTo(pos.x, pos.y);
    draw(e);
}

function handleMove(e) {
    if (!isDrawing) {
        return;
    }
    
    if (e.touches && e.touches.length > 1) {
        isDrawing = false;
        drawingContext.beginPath();
        return;
    }
    
    if (e.target === drawingCanvas && isDrawing) {
        e.preventDefault(); 
    }
    
    const pos = getEventPos(e);
    
    if (isErasing) {
        drawingContext.clearRect(pos.x - drawingContext.lineWidth / 2, pos.y - drawingContext.lineWidth / 2, drawingContext.lineWidth, drawingContext.lineWidth);
    } else {
        drawingContext.lineTo(pos.x, pos.y);
        drawingContext.stroke();
    }
}

function handleEnd(e) {
    isDrawing = false;
    drawingContext.beginPath();
}

drawingCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    drawingContext.strokeStyle = "white";
    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    drawingContext.beginPath();
    drawingContext.moveTo(x, y);
    draw(e);
});

drawingCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    const rect = drawingCanvas.getBoundingClientRect();
    const scaleX = drawingCanvas.width / rect.width;
    const scaleY = drawingCanvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    if (isErasing) {
        drawingContext.clearRect(x - drawingContext.lineWidth / 2, y - drawingContext.lineWidth / 2, drawingContext.lineWidth, drawingContext.lineWidth);
    } else {
        drawingContext.lineTo(x, y);
        drawingContext.stroke();
    }
});

drawingCanvas.addEventListener("mouseup", () => {
    isDrawing = false;
    drawingContext.beginPath();
});

drawingCanvas.addEventListener("mouseleave", () => {
    isDrawing = false;
});

brush.addEventListener('click', () => {

    brush.classList.add('selected');
    eraser.classList.remove('selected');
    isErasing = false;
    drawingContext.globalCompositeOperation = "source-over";
    drawingContext.strokeStyle = 'white';
});

eraser.addEventListener("click", () => {

    brush.classList.remove("selected");
    eraser.classList.add("selected");
    isErasing = true;
    drawingContext.globalCompositeOperation = "destination-out";
});

sizeInput.addEventListener("input", (e) => {
    drawingContext.lineWidth = e.target.value;
});

let clickedCoords = null;
let currentDot = null;

imageCanvas.addEventListener('click', function (e) {
    if (sam.classList.contains('type-select')) {
        const rect = imageCanvas.getBoundingClientRect();
        const scaleX = imageCanvas.width / rect.width;
        const scaleY = imageCanvas.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        const ctx = imageCanvas.getContext('2d');
        ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);

        const img = dragAndDrop.querySelector('.preview');
        if (img) {
            ctx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
        }

        clickedCoords = [x, y];
        currentDot = { x, y };

        ctx.beginPath();
        ctx.arc(x, y, 5, 0, 2 * Math.PI);
        ctx.fillStyle = 'red';
        ctx.fill();
    }
});


let maskOperationType = null;

submit.addEventListener('click', async (e) => {
    const originalContent = `<span class="submit-text">Submit</span>
        <span class="submit-divider"></span>
        <span class="dropdown-toggle">
            <i class="fa-solid fa-chevron-right"></i>
        </span>`;
    submit.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    submit.disabled = true;

    maskOperationType = selectedType;
    if (sam.classList.contains('type-select')) {
        console.log("Clicked coordinates:", clickedCoords);
        const imageData = imageCanvas.toDataURL();
        try {
            const response = await fetch('/ai_image_editor/api/generate-mask/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    image: imageData,
                    coords: clickedCoords,
                    operation_type: selectedType
                })
            });

            const result = await response.json();
            if (result.status === 'success') {
                const saveResponse = await fetch('/ai_image_editor/api/save-mask/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        mask: result.mask
                    })
                });

                const saveResult = await saveResponse.json();
                if (saveResult.status === 'success') {
                    currentSessionId = saveResult.session_id;
                    maskPreview.style.display = 'block';
                    maskPreview.style.width = 'auto';
                    maskPreview.style.height = 'auto';
                    maskPreview.style.maxWidth = '100%';
                    maskPreview.style.maxHeight = '100%';
                    const maskImage = new Image();
                    maskImage.onload = function () {
                        maskContext.clearRect(0, 0, maskPreview.width, maskPreview.height);
                        maskContext.drawImage(maskImage, 0, 0, maskPreview.width, maskPreview.height);
                        submit.innerHTML = originalContent;
                        submit.disabled = false;
                    };                    maskImage.src = result.mask;
                    popup.style.display = 'none';
                    popupBox.style.display = 'none';
                    
                    if (isTouchDevice && window.innerWidth <= 480) {
                        body.style.overflow = '';
                        body.style.position = '';
                        body.style.width = '';
                        body.style.height = '';
                    }
                }
            }
        } catch (error) {
            console.error('Error:', error);
            submit.innerHTML = originalContent;
            submit.disabled = false;
        }
    } else {
        const ctx = drawingCanvas.getContext('2d');
        if (selectedType === 'replace') {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = drawingCanvas.width;
            tempCanvas.height = drawingCanvas.height;
            const tempCtx = tempCanvas.getContext('2d');

            tempCtx.fillStyle = 'white';
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

            tempCtx.globalCompositeOperation = 'difference';
            tempCtx.drawImage(drawingCanvas, 0, 0);

            ctx.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
            ctx.drawImage(tempCanvas, 0, 0);
        }
        const maskData = drawingCanvas.toDataURL();
        const response = await fetch('/ai_image_editor/api/save-mask/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                mask: maskData
            })
        });

        const result = await response.json();
        if (result.status === 'success') {            currentSessionId = result.session_id;
            popup.style.display = 'none';
            popupBox.style.display = 'none';
            
            if (isTouchDevice && window.innerWidth <= 480) {
                body.style.overflow = '';
                body.style.position = '';
                body.style.width = '';
                body.style.height = '';
            }
            
            maskPreview.style.display = 'block';
            maskPreview.style.width = 'auto';
            maskPreview.style.height = 'auto';
            maskPreview.style.maxWidth = '100%';
            maskPreview.style.maxHeight = '100%';
            maskContext.clearRect(0, 0, maskPreview.width, maskPreview.height);
            maskContext.drawImage(drawingCanvas, 0, 0);
            submit.innerHTML = originalContent;
            submit.disabled = false;
        }
    }
});


sam.addEventListener('click', () => {
    sam.classList.add('type-select');
    mannual.classList.remove('type-select');
    paintOption.style.display = 'none';
    drawingCanvas.style.pointerEvents = 'none';
    imageCanvas.style.pointerEvents = 'auto';
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    const existingPreview = dragAndDrop.querySelector('.preview');
    if (existingPreview) {
        existingPreview.style.display = 'block';
    }
});

mannual.addEventListener('click', () => {
    mannual.classList.add('type-select');
    sam.classList.remove('type-select');
    paintOption.style.display = 'block';
    drawingCanvas.style.pointerEvents = 'auto';
    imageCanvas.style.pointerEvents = 'none';

    const ctx = imageCanvas.getContext('2d');
    ctx.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    const img = dragAndDrop.querySelector('.preview');
    if (img) {
        ctx.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
    }
    currentDot = null;
    clickedCoords = null;

    const existingPreview = dragAndDrop.querySelector('.preview');
    if (existingPreview) {
        existingPreview.style.display = 'block';
    }
});


function resetPreview() {
    drawingCanvas.style.zIndex = '-1';
    imageContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
    drawingContext.clearRect(0, 0, drawingCanvas.width, drawingCanvas.height);
    maskContext.clearRect(0, 0, maskPreview.width, maskPreview.height);

    const existingPreview = dragAndDrop.querySelector('.preview');
    if (existingPreview) existingPreview.remove();

    msg.innerHTML = 'Drop Image Here or Click to Upload';
    msg.style.display = 'block';
    icon.style.display = 'block';
    closeIcon.style.display = 'none';
    dragAndDrop.style.pointerEvents = 'auto';
    dragAndDrop.style.border = '2px solid white';
    fileInput.value = '';
    fileInput.disabled = false;

    drawingContext.globalCompositeOperation = "source-over";
    drawingContext.strokeStyle = "white";
    drawingContext.lineWidth = 50;
    drawingContext.lineCap = "round";

    brush.classList.add('selected');
    eraser.classList.remove('selected');
    isErasing = false;

    drawingCanvas.style.pointerEvents = 'auto';
    drawingCanvas.style.zIndex = '1';
    drawingCanvas.style.display = 'none';
    imageCanvas.style.display = 'none';
    maskPreview.style.display = 'none';    currentSessionId = null;    
    
    const finalContainer = document.querySelector('.final-container');
    finalContainer.style.display = 'none';
      popup.style.display = 'none';
    popupBox.style.display = 'none';
    body.style.background = 'linear-gradient(to bottom, #111827, #000000)';
    
    if (isTouchDevice && window.innerWidth <= 480) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
    }

    setCanvasSizes();
}


function preview(file) {
    popup.style.display = 'block';
    body.style.background = 'rgba(0, 0, 0, 0.7)';
    body.style.backdropFilter = 'blur(5px)';
    popupBox.style.display = 'block';
    
    if (isTouchDevice && window.innerWidth <= 480) {
        document.documentElement.style.overflow = '';
        document.body.style.overflow = '';
        
        popupBox.style.overflowY = 'auto';
        popupBox.style.overflowX = 'hidden';
    popupBox.style.touchAction = 'pan-y';
    popupBox.style.webkitOverflowScrolling = 'touch';
    popupBox.style.overscrollBehavior = 'contain';
        
        drawingCanvas.style.touchAction = 'none'; 
        
    popup.style.touchAction = 'none';
    }
    
    const existingPreview = dragAndDrop.querySelector('.preview');

    if (existingPreview) existingPreview.remove();

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                imageCanvas.width = img.naturalWidth;
                imageCanvas.height = img.naturalHeight;
                drawingCanvas.width = img.naturalWidth;
                drawingCanvas.height = img.naturalHeight;
                maskPreview.width = img.naturalWidth;
                maskPreview.height = img.naturalHeight;

                drawingContext.lineWidth = 50;
                drawingContext.strokeStyle = "white";
                drawingContext.lineCap = "round";
                drawingContext.globalCompositeOperation = "source-over";

                drawingCanvas.style.display = 'block';
                imageCanvas.style.display = 'block';

                imageContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
                imageContext.drawImage(img, 0, 0);

                const image = document.createElement('img');
                image.src = reader.result;
                image.className = 'preview';
                dragAndDrop.appendChild(image);

                const dropdownToggle = document.querySelector('.dropdown-toggle');
                const submitDropdown = document.querySelector('.submit-dropdown');
                const oldToggle = dropdownToggle.cloneNode(true);
                dropdownToggle.parentNode.replaceChild(oldToggle, dropdownToggle);

                oldToggle.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    oldToggle.classList.toggle('active');
                    submitDropdown.classList.toggle('show');
                });
                document.querySelectorAll('.dropdown-item').forEach(item => {
                    const oldItem = item.cloneNode(true);
                    item.parentNode.replaceChild(oldItem, item);

                    if (oldItem.dataset.type === selectedType) {
                        oldItem.classList.add('selected');
                    }

                    oldItem.addEventListener('click', () => {
                        selectedType = oldItem.dataset.type;
                        document.querySelectorAll('.dropdown-item').forEach(i => i.classList.remove('selected'));
                        oldItem.classList.add('selected');
                        submitDropdown.classList.remove('show');
                        oldToggle.classList.remove('active');
                    });
                });
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    msg.style.display = 'none';
    icon.style.display = 'none';
    closeIcon.style.display = 'block';
    dragAndDrop.style.pointerEvents = 'none';
}

function setupPopupTouchHandling() {
    if (!isTouchDevice) return;
    
    popupBox.addEventListener('touchstart', function(e) {
        if (e.target !== drawingCanvas && !drawingCanvas.contains(e.target)) {
            e.stopPropagation();
        }
    }, { passive: true });
    
    popupBox.addEventListener('touchmove', function(e) {
        if (e.target !== drawingCanvas && !drawingCanvas.contains(e.target)) {
            e.stopPropagation();
        }
    }, { passive: true });
    
    let touchStartY = 0;
    let scrollStartY = 0;
    
    popupBox.addEventListener('touchstart', function(e) {
        if (e.touches.length === 2) {
            touchStartY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            scrollStartY = popupBox.scrollTop;
        }
    }, { passive: true });
    
    popupBox.addEventListener('touchmove', function(e) {
        if (e.touches.length === 2) {
            const touchCurrentY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
            const deltaY = touchStartY - touchCurrentY;
            const scrollSpeed = window.innerWidth <= 480 ? 1.2 : 1.0; 
            popupBox.scrollTop = scrollStartY + (deltaY * scrollSpeed);
            e.preventDefault(); 
        }
    }, { passive: false });
}

document.addEventListener('DOMContentLoaded', setupPopupTouchHandling);


function draw(e) {
    if (!isDrawing) return;

    const pos = getEventPos(e);
    
    drawingContext.lineWidth = sizeInput.value;
    drawingContext.lineCap = 'round';
    drawingContext.lineTo(pos.x, pos.y);
    drawingContext.stroke();
    drawingContext.beginPath();
    drawingContext.moveTo(pos.x, pos.y);
}

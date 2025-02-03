const dragAndDrop = document.querySelector('.drag-and-drop');
const fileInput = document.querySelector('.file-input');
const msg = document.querySelector('.drag-drop-msg');
const icon = document.querySelector('.content i');
const content = document.querySelector('.content');
const back = document.querySelector('.back');
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

let isDrawing = false;
let isErasing = false;

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
        preview(file);
    }
});

closeIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    resetPreview();
    fileInput.disabled = false;
});

back.addEventListener('click', () => {
    window.close();
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

drawingContext.lineWidth = 50;
drawingContext.strokeStyle = "white";
drawingContext.lineCap = "round";
drawingContext.globalCompositeOperation = "source-over";

drawingCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    drawingContext.strokeStyle = "white";
    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawingContext.beginPath();
    drawingContext.moveTo(x, y);

    draw(e);
});

drawingCanvas.addEventListener("mousemove", (e) => {
    if (!isDrawing) return;

    if (isErasing) {
        drawingContext.clearRect(e.offsetX - drawingContext.lineWidth / 2, e.offsetY - drawingContext.lineWidth / 2, drawingContext.lineWidth, drawingContext.lineWidth);
    } else {
        drawingContext.lineTo(e.offsetX, e.offsetY);
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


submit.addEventListener('click', (e) => {
    popup.style.display = 'none';
    popupBox.style.display = 'none';
    maskPreview.style.display = 'block';
    maskContext.clearRect(0, 0, maskPreview.width, maskPreview.height);
    maskContext.drawImage(drawingCanvas, 0, 0);
});

sam.addEventListener('click', () => {
    sam.classList.add('type-select');
    mannual.classList.remove('type-select');
    paintOption.style.display = 'none';

})

mannual.addEventListener('click', () => {
    mannual.classList.add('type-select');
    sam.classList.remove('type-select');
    paintOption.style.display = 'block';
})


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
}

function preview(file) {
    popup.style.display = 'block';
    body.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    body.style.backdropFilter = 'blur(5px)';
    popupBox.style.display = 'block';
    drawingCanvas.style.zIndex = '9';
    const existingPreview = dragAndDrop.querySelector('.preview');

    if (existingPreview) existingPreview.remove();

    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                drawingCanvas.style.zIndex = '9';
                imageContext.clearRect(0, 0, imageCanvas.width, imageCanvas.height);
                imageContext.drawImage(img, 0, 0, imageCanvas.width, imageCanvas.height);
                const image = document.createElement('img');
                image.src = reader.result;
                image.className = 'preview';
                dragAndDrop.appendChild(image);
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

function draw(e) {
    if (!isDrawing) return;

    const rect = drawingCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    drawingContext.lineWidth = sizeInput.value;
    drawingContext.lineCap = 'round';
    drawingContext.lineTo(x, y);
    drawingContext.stroke();
    drawingContext.beginPath();
    drawingContext.moveTo(x, y);
}
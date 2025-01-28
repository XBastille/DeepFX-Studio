const dragAndDrop = document.querySelector('.drag-and-drop');
const fileInput = document.querySelector('.file-input');
const msg = document.querySelector('.drag-drop-msg');
const icon = document.querySelector('.content i');
const content = document.querySelector('.content');
const back = document.querySelector('.back');
const slide = document.querySelector('.slide');
const container = document.querySelector('.container');
const closeIcon = document.querySelector('.close-icon');

slide.addEventListener('input', (e) => {
    container.style.setProperty('--position', `${e.target.value}%`);
})

back.addEventListener('click', () => {
    window.close();
})

dragAndDrop.addEventListener('click', () => {
    fileInput.click();
})

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

fileInput.addEventListener('change', () => {
    const file = this.files[0];
    preview(file);
})

dragAndDrop.addEventListener('drop', (e) => {
    e.preventDefault();
    icon.style.display = 'none';
    msg.style.display = 'none';
    fileInput.files = e.dataTransfer.files;
    const file = e.dataTransfer.files[0];
    if (file) {
        console.log('file uploaded');
    }

    preview(file);


});

closeIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    resetPreview();
});



function resetPreview() {

    // preview hatao madharchod 
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



function preview(file, index) {

    // preview krne k baad fir change krna pada tb next ka preview ..... iski maa ka kitna krna padta hai 
    const existingPreview = dragAndDrop.querySelector('.preview');
    if (existingPreview) existingPreview.remove();

    const reader = new FileReader();
    reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result;
        img.className = 'preview';
        dragAndDrop.appendChild(img);
    };
    reader.readAsDataURL(file);

    msg.style.display = 'none';
    icon.style.display = 'none';
    closeIcon.style.display = 'block';
    dragAndDrop.style.pointerEvents = 'none';
}
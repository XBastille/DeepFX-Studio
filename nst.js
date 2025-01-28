const dragAndDrop = document.querySelectorAll('.drag-and-drop');
const fileInput = document.querySelectorAll('.file-input');
const msg = document.querySelectorAll('.drag-drop-msg');
const content = document.querySelector('.content');
const cloudIcons = document.querySelectorAll('.cloud');
const back = document.querySelector('.back');
const closeIcons = document.querySelectorAll('.close-icon');

back.addEventListener('click', () => {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        console.log("Cannot close window directly");
    }
});

dragAndDrop.forEach((dropZone, index) => {
    const input = fileInput[index];
    const message = msg[index];
    const closeIcon = closeIcons[index];

    // Click krke input krna hoga to ye wala 
    dropZone.addEventListener('click', () => {
        input.click();
    });

    // Drag krne pr ye wala 
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.border = '2px dashed white';
        message.innerHTML = 'Release the image to upload';
    });

    // Drag krke wapas jb hatayenge cursor ko tb ye wala 
    dropZone.addEventListener('dragleave', () => {
        dropZone.style.border = '2px solid white';
        message.innerHTML = 'Drop Image Here or Click to Upload';
    });

    // baar baar file change karenge tb ye taki ek saath 1 se jyada file n aa jaye 
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            preview(file, index);
        }
    });

    // drop krne k baad ye wala run karega 
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.border = '2px solid white';
        input.files = e.dataTransfer.files;
        const file = e.dataTransfer.files[0];
        if (file) {
            preview(file, index);
        }
    });

    // Close icon pr click krke image hatane k liye ye wala hai 
    closeIcon.addEventListener('click', (e) => {
        e.stopPropagation();
        resetPreview(index);
    });
});

function preview(file, index) {
    const message = msg[index];
    const closeIcon = closeIcons[index];
    const dropZone = dragAndDrop[index];
    const cloudIcon = cloudIcons[index];

    // preview krne k baad fir change krna pada tb next ka preview ..... iski maa ka kitna krna padta hai 
    const existingPreview = dropZone.querySelector('.preview');
    if (existingPreview) existingPreview.remove();

    const reader = new FileReader();
    reader.onload = () => {
        const img = document.createElement('img');
        img.src = reader.result;
        img.className = 'preview';
        dropZone.appendChild(img);
    };
    reader.readAsDataURL(file);

    message.style.display = 'none';
    cloudIcon.style.display = 'none';
    closeIcon.style.display = 'block';
    dropZone.style.pointerEvents = 'none';
}

// ye tmhara close icon k andar wala kaam hai bahar function bana k lete aye h taki padhne m asan ho humko 
function resetPreview(index) {
    const message = msg[index];
    const closeIcon = closeIcons[index];
    const dropZone = dragAndDrop[index];
    const input = fileInput[index];
    const cloudIcon = cloudIcons[index];

    // preview hatao madharchod 
    const existingPreview = dropZone.querySelector('.preview');
    if (existingPreview) existingPreview.remove();

    message.innerHTML = 'Drop Image Here or Click to Upload';
    message.style.display = 'block';
    cloudIcon.style.display = 'block';
    closeIcon.style.display = 'none';
    dropZone.style.pointerEvents = 'auto';
    dropZone.style.border = '2px solid white';
    input.value = '';
}

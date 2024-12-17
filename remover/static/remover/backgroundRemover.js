const dragAndDrop = document.querySelector('.drag-and-drop');
const fileInput = document.querySelector('.file-input');
const msg = document.querySelector('.drag-drop-msg');
const icon = document.querySelector('.content i');
const content = document.querySelector('.content');
const back = document.querySelector('.back');
const closeIcon = document.querySelector('.close-icon');
const generateBtn = document.querySelector('.generate');


back.addEventListener('click',()=>{
    window.close();
})

dragAndDrop.addEventListener('click',()=>{
    fileInput.click();
})

dragAndDrop.addEventListener('dragover',(e)=>{
    e.preventDefault();
    dragAndDrop.style.border='2px dashed white';
    msg.innerHTML = 'Release the image to upload';
});
dragAndDrop.addEventListener('dragleave',(e)=>{
    e.preventDefault();
    dragAndDrop.style.border='2px solid white';
    msg.innerHTML = 'Drop Image Here or Click to Upload';
});

fileInput.addEventListener('change', function(e) {
    if (this.files.length > 0) {
        const file = this.files[0];
        preview(file);
    }
});

dragAndDrop.addEventListener('drop',(e)=>{
    e.preventDefault();
    icon.style.display='none';
    msg.style.display='none';
    fileInput.files = e.dataTransfer.files;
    const file = e.dataTransfer.files[0];
    if(file){
        console.log('file uploaded');
    }

    preview(file);
    
    
});



function preview(file){
    const img = document.querySelectorAll('.preview');
    const imgName = document.querySelectorAll('.img-name');
    img.forEach(item =>{
        item.remove();
    });
    imgName.forEach(item =>{
        item.remove();
    });

    msg.style.display = 'none';
    icon.style.display = 'none';
    closeIcon.style.display = 'block';

    dragAndDrop.style.pointerEvents = 'none';

    const reader = new FileReader();
    reader.onload =() =>{
        const url = reader.result;
        const img = document.createElement('img');
        img.src = url;
        img.className = 'preview';
        content.appendChild(img);
    }
    reader.readAsDataURL(file);
}

closeIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    const preview = document.querySelector('.preview');
    if (preview) preview.remove();
    
    msg.style.display = 'block';
    icon.style.display = 'block';
    closeIcon.style.display = 'none';
    dragAndDrop.style.pointerEvents = 'auto';
    dragAndDrop.style.border = '2px solid white';
    fileInput.value = '';
});

generateBtn.addEventListener('click', async () => {
    const preview = document.querySelector('.preview');
    if (!preview) return;
    
    const canvas = document.createElement('canvas');
    canvas.width = preview.naturalWidth;
    canvas.height = preview.naturalHeight;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(preview, 0, 0, preview.naturalWidth, preview.naturalHeight);
    
    const imageData = canvas.toDataURL('image/png', 1.0);
    
    generateBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i>Processing...';
    generateBtn.style.pointerEvents = 'none';
    
    try {
        const response = await fetch('/remove-background/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `image=${encodeURIComponent(imageData)}`
        });
        
        const data = await response.json();
        
        const popup = document.createElement('div');
        popup.className = 'result-popup';
        popup.innerHTML = `
            <div class="popup-content">
                <img src="data:image/png;base64,${data.processed_image}" alt="Processed Image">
                <button class="download-btn">Download</button>
                <button class="close-btn">Close</button>
            </div>
        `;
        
        document.body.appendChild(popup);
        
        popup.querySelector('.download-btn').addEventListener('click', () => {
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${data.processed_image}`;
            link.download = 'removed_background.png';
            link.click();
        });
        
        popup.querySelector('.close-btn').addEventListener('click', () => {
            popup.remove();
        });
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        generateBtn.innerHTML = '<i class="fa-solid fa-palette"></i>GENERATE';
        generateBtn.style.pointerEvents = 'auto';
    }
});
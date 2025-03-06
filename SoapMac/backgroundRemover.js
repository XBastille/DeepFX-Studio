const dragAndDrop = document.querySelector('.drag-and-drop');
const fileInput = document.querySelector('.file-input');
const msg = document.querySelector('.drag-drop-msg');
const icon = document.querySelector('.content i');
const content = document.querySelector('.content');
const back = document.querySelector('.back');

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

fileInput.addEventListener('change',()=>{
    const file = this.files[0];
    preview(file);
})

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
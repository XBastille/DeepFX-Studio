const dragAndDrop = document.querySelector('.drag-and-drop');
const fileInput = document.querySelector('.file-input');
const msg = document.querySelector('.drag-drop-msg');
const icon = document.querySelector('.content i');
const content = document.querySelector('.content');
const back = document.querySelector('.back');

back.addEventListener('click',()=>{
    window.close();
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
dragAndDrop.addEventListener('drop',(e)=>{
    e.preventDefault();
    icon.style.display='none';
    msg.style.display='none';
    const files = e.dataTransfer.files;
    const file = files[0];
    if(file){
        console.log('file uploaded');
    }

    preview(file);
    
    
});



function preview(file){
    const reader = new FileReader();
    reader.onload=()=>{
        const url = reader.result;
        console.log(url);
        const img = document.createElement('img');
        img.src = url;
        img.className = 'preview';
        // const span = document.createElement('span');
        // span.className = 'img-name';
        content.appendChild(img);
        // dragAndDrop.appendChild('span');
    }
    reader.readAsDataURL(file);
}
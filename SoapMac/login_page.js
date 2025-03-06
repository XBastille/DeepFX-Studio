const eye = document.querySelector('.show img');
const password = document.querySelector('#password');

eye.addEventListener('click',()=>{
    if(password.type == 'password'){
        password.type = 'text';
        eye.src = 'Media/eye-close.png';
    }
    else{
        password.type = 'password';
        eye.src ='Media/eye-open-blue.png';
    }
})
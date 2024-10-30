const passEye = document.querySelector('.show .password-eye');
const conEye = document.querySelector('.show .confirm-eye');

const user = document.querySelector('#user');
const email = document.querySelector('#email');
const password = document.querySelector('#password');
const confirmP = document.querySelector('#confirm');

const userError = document.querySelector('#userError');
const emailError = document.querySelector('#emailError');
const passwordError = document.querySelector('#passwordError')

const signup = document.querySelector('.btn button');

passEye.addEventListener('click',()=>{
    if(password.type == 'password'){
        password.type = 'text';
        passEye.src = 'Media/eye-close.png';
    }
    else{
        password.type = 'password';
        passEye.src ='Media/eye-open-blue.png';
    }
})

conEye.addEventListener('click',()=>{
    if(confirmP.type == 'password'){
        confirmP.type = 'text';
        conEye.src = 'Media/eye-close.png';
    }
    else{
        confirmP.type = 'password';
        conEye.src ='Media/eye-open-blue.png';
    }
})

const verification=()=>{
    if(user.value == ""){
        userError.classList.add("errorOccured");
        user.classList.add("errorBorder");
        return false;
    }
    if(!email.value.match(/^[A-Za-z\._\-0-9]*[@][A-Za-z]*[\.][a-z]{2,4}$/)){
        emailError.classList.add("errorOccured");
        email.classList.add("errorBorder");
        userError.classList.remove("errorOccured");
        user.classList.remove("errorBorder");
        return false;
    }
    if(password.value != confirmP.value || password.value ==""){
        passwordError.classList.add("errorOccured");
        password.classList.add("errorBorder");
        confirmP.classList.add("errorBorder");
        emailError.classList.remove("errorOccured");
        email.classList.remove("errorBorder");
        userError.classList.remove("errorOccured");
        user.classList.remove("errorBorder");

        return false;
    }
    else{
        console.log('submitted');
        return true ;
        
    }
}


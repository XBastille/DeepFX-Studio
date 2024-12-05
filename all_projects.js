const options = document.querySelectorAll('.mainarea .leftside div');
const wishing = document.querySelector('.wish');
// const option1 = document.querySelector('.option1');
// const option2 = document.querySelector('.option2');
// const option3 = document.querySelector('.option3');
const dropdown = document.querySelector('.dropdown');
const dropdownmenus = document.querySelectorAll('.dropdown-hover');
const navmenu = document.querySelector('.nav-menu');
const dropdownShow = document.querySelector('.dropdown-show');
const projectDropdown = document.querySelector('.project-dropdown');

options.forEach(option => {

    option.addEventListener('click', () => {
        document.querySelector('.clicked')?.classList.remove('clicked');

        option.classList.add('clicked')
    })

});

// option1.addEventListener('click',()=>{
//     option1.classList.add('selected');
//     option2.classList.remove('selected');
//     option3.classList.remove('selected');
// });
// option2.addEventListener('click',()=>{
//     option1.classList.remove('selected');
//     option2.classList.add('selected');
//     option3.classList.remove('selected');
// });
// option3.addEventListener('click',()=>{
//     option1.classList.remove('selected');
//     option2.classList.remove('selected');
//     option3.classList.add('selected');
// });

navmenu.addEventListener('mouseenter',()=>{
    dropdown.style.display='block';
})
dropdown.addEventListener('mouseenter',()=>{
    dropdown.style.display='block';
})

navmenu.addEventListener('mouseleave',()=>{
    dropdown.style.display='none';
})
dropdown.addEventListener('mouseleave',()=>{
    dropdown.style.display='none';
})

function greeting() {
    var date = new Date()
    var hours = date.getHours();
    var wish;

    if (hours < 12) {
        wish = 'Good Morning';
        wishing.innerHTML=wish;
    }
    else if (hours > 12 && hours < 16) {
        wish = 'Good Afternoon';
        wishing.innerHTML=wish;
    }
    else {
        wish = 'Good Evening';
        wishing.innerHTML=wish;
    }
}

greeting();


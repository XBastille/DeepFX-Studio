// const chat = document.querySelector('.sidelist');
// const arrow = document.querySelector('.fa-chevron-down');


// arrow.addEventListener('click',()=>{
//     chat.classList.toggle('showList');
// })


const options = document.querySelectorAll('.mainarea .leftside div');
const wishing = document.querySelector('.wish');

options.forEach(option => {

    option.addEventListener('click', () => {
        document.querySelector('.clicked')?.classList.remove('clicked');

        option.classList.add('clicked')
    })

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


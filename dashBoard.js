const options = document.querySelectorAll('.mainarea .leftside div');
const wishing = document.querySelector('.wish');
const dropdown = document.querySelector('.dropdown');
const option1 = document.querySelector('.option1');
const option2 = document.querySelector('.option2');
const option3 = document.querySelector('.option3');
const navmenu = document.querySelector('.nav-menu');
const newbtn = document.querySelector('.newproject');
const popup = document.querySelector('.popup-container');
const closepopup = document.querySelector('.close-btn i');
const createbtn = document.querySelector('.btn');
const projectName = document.querySelector('.project-name');
const projectDesc = document.querySelector('.project-desc');
const nameWarning = document.querySelector('.name-warning');
const descWarning = document.querySelector('.desc-warning');
const gridarea = document.querySelector('.gridarea');
const gridpic = document.querySelector('.gridpic');
const boxicon = document.querySelectorAll('.gridicon');



options.forEach(option => {

    option.addEventListener('click', () => {
        document.querySelector('.clicked')?.classList.remove('clicked');

        option.classList.add('clicked')
    })

});

option1.addEventListener('click',()=>{
    option1.classList.add('selected');
    option2.classList.remove('selected');
    option3.classList.remove('selected');
});
option2.addEventListener('click',()=>{
    option1.classList.remove('selected');
    option2.classList.add('selected');
    option3.classList.remove('selected');
});
option3.addEventListener('click',()=>{
    option1.classList.remove('selected');
    option2.classList.remove('selected');
    option3.classList.add('selected');
});


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

newbtn.addEventListener('click',()=>{
    projectName.value = "";
    projectDesc.value = "";
    popup.style.display='block';
})

closepopup.addEventListener('click',()=>{
    popup.style.display='none';
})

function toggleHeartColor(event) {
    const heart = event.target;

    const currentColor = getComputedStyle(heart).color;

    if (currentColor === 'rgb(255, 0, 0)') {
        heart.style.color = 'black';
    } else {
        heart.style.color = 'red';
    }
}

boxicon.forEach(heart => {
    heart.addEventListener('click', toggleHeartColor);
});

createbtn.addEventListener('click',()=>{
    console.log(projectName.value);
    if(!projectName.value){
        nameWarning.innerHTML="project name is required";
        descWarning.innerHTML="";
        return;
    }
    
    let gridpic = document.createElement('div');
    gridpic.classList.add('gridpic');

    let gridicon = document.createElement('i');
    gridicon.classList.add('fa-solid','fa-heart','gridicon');
    gridicon.addEventListener('click', toggleHeartColor);
    gridpic.appendChild(gridicon);

    let gridtitle = document.createElement('p');
    gridtitle.innerText = projectName.value;

    let gridname = document.createElement('div');
    gridname.classList.add('gridname');
    gridname.appendChild(gridtitle);

    let newgrid = document.createElement('div');
    newgrid.classList.add('boxes')
    gridarea.insertBefore(newgrid,gridarea.firstChild);
    popup.style.display='none';

    newgrid.appendChild(gridpic);
    newgrid.appendChild(gridname);


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


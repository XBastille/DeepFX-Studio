
// Form
const form = document.querySelector('#upload-form');


document.addEventListener('DOMContentLoaded', function () {
    form.addEventListener('submit', function (event) {
        const fileInput = document.querySelector('#file_input');
        if (!fileInput.value) {
            event.preventDefault();
            alert("Please select a file before submitting!");
        }
    });
});

document.addEventListener("dragover",(event) => {
    event.preventDefault();
    document.querySelector("#upload-container").innerHTML="Release the image to upload"
});
// add drag related animation 



// GSAP Animations

// Add Smooth Scrolling for pages by GSAP Animation

document.addEventListener("DOMContentLoaded", function() {
    // Fade in and slide up animation for heading and description
    gsap.from("#tool-name", { opacity: 0, y: 30, duration: 1, delay: 0.3 });
    gsap.from("#tool-desc", { opacity: 0, y: 30, duration: 1, delay: 0.4 });
    gsap.from("#form-section", { opacity: 0, x: 30, y:10, duration: 1, delay: 0.4 });
});
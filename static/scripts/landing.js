import { Application } from 'https://unpkg.com/@splinetool/runtime@1.9.29/build/runtime.js';

const canvas = document.getElementById('spline-container__canvas3d');
const spline = new Application(canvas);
spline.load('https://prod.spline.design/v7lcNzOxxaKgcWYr/scene.splinecode');


document.addEventListener("DOMContentLoaded", () => {
    const headline = document.querySelector(".hero__headline");
    const originalHTML = headline.innerHTML;

    const PLACEHOLDER = "___BR___";
    const textWithPlaceholders = originalHTML.replace(/<br\s*\/?>/gi, ` ${PLACEHOLDER} `);
    const words = textWithPlaceholders.trim().split(/\s+/);

    headline.innerHTML = "";

    words.forEach((word, i) => {
        if (word === PLACEHOLDER) {
            headline.appendChild(document.createElement("br"));
        } else {
            const span = document.createElement("span");
            span.textContent = word + " ";
            span.classList.add("word");
            span.style.animationDelay = `${i * 0.1}s`;
            headline.appendChild(span);
            headline.appendChild(document.createTextNode(" "))
        }
    });

});

AOS.init({
    offset: 300,
    duration: 1000,
});

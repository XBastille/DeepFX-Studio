import { Application } from "https://unpkg.com/@splinetool/runtime@1.9.29/build/runtime.js";

const canvas = document.getElementById("spline-container__canvas3d");
const spline = new Application(canvas);
spline.load("https://prod.spline.design/v7lcNzOxxaKgcWYr/scene.splinecode");

document.addEventListener("DOMContentLoaded", () => {
    // GSAP Plugin Register
    gsap.registerPlugin(ScrollTrigger, SplitText);

    // Navbar Dropdown
    const toggleBtn = document.getElementById("dropdownToggle");
    const toggleIcon = document.querySelector(".fa-square-caret-down");
    const menu = document.getElementById("dropdownMenu");

    toggleBtn.addEventListener("click", () => {
        menu.classList.toggle("show");
        toggleIcon.classList.toggle("fa-rotate-270");
    });

    document.addEventListener("click", (e) => {
        if (!toggleBtn.contains(e.target) && !menu.contains(e.target)) {
            menu.classList.remove("show");
        }
    });

    // GSAP Animation for Hero Section
    const heroHeadline = new SplitText(".hero__headline", { type: 'words,chars' });
    const heroParagraph = new SplitText(".hero__description", { type: 'lines' });

    // Add gradient class for each character
    heroHeadline.chars.forEach(char => char.classList.add("text-gradient"));
    // Headline Animation
    gsap.from(heroHeadline.chars, {
        y: 100,
        scale: 1.4,
        rotationX: 45,
        opacity: 0,
        duration: 1.1,
        ease: "power4.out",
        stagger: {
            each: 0.03,
            from: "start"
        }
    });

    // Paragraph Animation
    gsap.from(heroParagraph.lines, {
        opacity: 0,
        y: 50,
        clipPath: "inset(0 0 100% 0)",
        duration: 1.5,
        ease: "power4.out",
        stagger: 0.1,
        delay: 1.2
    });

    gsap.from(".hero__cta", {
        opacity: 0,
        y: 40,
        duration: 1,
        ease: "power3.out",
        delay: 2.2
    });

    // GSAP Animation for Showcase section
    const showcaseHeadline = new SplitText(".showcase__title", { type: 'lines' });
    gsap.from(showcaseHeadline.lines, {
        scrollTrigger: {
            trigger: ".showcase__header",
            start: "top 90%",
        },
        y: 80,
        opacity: 0,
        scale: 1.3,
        ease: "power4.out",
        stagger: {
            each: 0.03,
            from: "start",
        },
        duration: 1,
    });

    // Animate gallery cards on scroll
    gsap.utils.toArray(".showcase__gallery__card").forEach((card, i) => {
        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: "top 85%",
                toggleActions: "play none none reverse",
            },
            y: 60,
            opacity: 0,
            scale: 0.95,
            duration: 1,
            ease: "power3.out",
            delay: i * 0.15, // staggered delay
        });
    });



    // Sticky Scroll Reveal section
    const cardHeader = new SplitText(".scroll-sync__header", { type: "lines" });

    gsap.from(cardHeader.lines, {
        scrollTrigger: {
            trigger: ".scroll-sync__header",
            start: "top center",
        },
        yPercent: 100,
        opacity: 0,
        scale: 1.05,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
    });

    // Image switching logic with fade transition
    const stickyImage = document.getElementById("sticky-image");
    const blocks = document.querySelectorAll(".scroll-sync__text-block");

    blocks.forEach((block, index) => {
        const imageSrc = block.getAttribute("data-image");
        ScrollTrigger.create({
            trigger: block,
            start: "top center+=70",
            end: "bottom center",
            onEnter: () => {
                gsap.to(stickyImage, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        stickyImage.src = imageSrc;
                        gsap.to(stickyImage, { opacity: 1, duration: 0.3 });
                    },
                });
            },
            onEnterBack: () => {
                gsap.to(stickyImage, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        stickyImage.src = imageSrc;
                        gsap.to(stickyImage, { opacity: 1, duration: 0.3 });
                    },
                });
            },
        });
    })

    // Animate each text block on scroll
    gsap.utils.toArray(".scroll-sync__text-block").forEach((block) => {
        gsap.from(block, {
            scrollTrigger: {
                trigger: block,
                start: "top 80%",
                toggleActions: "play none none reverse",
            },
            y: 80,
            opacity: 0,
            duration: 1.2,
            ease: "expo.out",
        });
    });
});

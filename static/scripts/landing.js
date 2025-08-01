import { Application } from "https://unpkg.com/@splinetool/runtime@1.9.29/build/runtime.js";

const canvas = document.getElementById("spline-container__canvas3d");
const spline = new Application(canvas);
spline.load("https://prod.spline.design/v7lcNzOxxaKgcWYr/scene.splinecode");

document.addEventListener("DOMContentLoaded", () => {
    // GSAP Plugin Register
    gsap.registerPlugin(ScrollTrigger, SplitText);

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

    const initAIShowcase = () => {
        const prompts = [
            "Astronaut walking on an alien planet with purple sky",
            "A majestic dragon soaring through clouds at sunset",
            "Enchanted forest with glowing mushrooms and fireflies"
        ];
        
        const images = [
            "/static/images/15.png",
            "/static/images/14.png",
            "/static/images/13.png"
        ];
        
        let currentPromptIndex = 0;
        let typeItInstance = null;
        
        const startTypewriterCycle = () => {
            if (typeItInstance) {
                typeItInstance.destroy();
            }
            
            const textElement = document.getElementById("typewriter-text");
            textElement.innerHTML = "";
            
            typeItInstance = new TypeIt("#typewriter-text", {
                speed: 80,
                deleteSpeed: 40,
                waitUntilVisible: true,
                afterComplete: function(instance) {
                    setTimeout(() => {
                        showLoadingAnimation();
                    }, 1000);
                    
                    setTimeout(() => {
                        showGeneratedImage();
                    }, 3500);
                    
                    setTimeout(() => {
                        hideImage();
                        currentPromptIndex = (currentPromptIndex + 1) % prompts.length;
                        startTypewriterCycle();
                    }, 6000);
                }
            })
            .type(prompts[currentPromptIndex])
            .go();
        };
        
        const showLoadingAnimation = () => {
            const loadingAnimation = document.querySelector('.loading-animation');
            const generatedImage = document.querySelector('.generated-image');
            
            loadingAnimation.classList.remove('hide');
            generatedImage.classList.remove('show');
        };
        
        const showGeneratedImage = () => {
            const loadingAnimation = document.querySelector('.loading-animation');
            const generatedImage = document.querySelector('.generated-image');
            
            generatedImage.src = images[currentPromptIndex];
            
            loadingAnimation.classList.add('hide');
            generatedImage.classList.add('show');
        };
        
        const hideImage = () => {
            const generatedImage = document.querySelector('.generated-image');
            generatedImage.classList.remove('show');
        };
        
        startTypewriterCycle();
        
        gsap.from(".ai-showcase__hero", {
            scrollTrigger: {
                trigger: ".ai-showcase",
                start: "top 70%",
            },
            y: 60,
            opacity: 0,
            duration: 1.2,
            ease: "power3.out",
        });
        
        gsap.utils.toArray(".flip-card").forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                },
                y: 80,
                opacity: 0,
                scale: 0.9,
                duration: 1,
                ease: "back.out(1.7)",
                delay: i * 0.1,
            });
        });
        
        document.querySelectorAll('.info-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.flip-card');
                const inner = card.querySelector('.flip-card-inner');
                
                if (inner.classList.contains('flipped')) {
                    inner.classList.remove('flipped');
                } else {
                    inner.classList.add('flipped');
                }
                
                gsap.to(btn, {
                    scale: 0.8,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut",
                });
            });
        });
        
        document.querySelectorAll('.back-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const card = btn.closest('.flip-card');
                const inner = card.querySelector('.flip-card-inner');
                
                inner.classList.remove('flipped');
                
                gsap.to(btn, {
                    scale: 0.8,
                    duration: 0.1,
                    yoyo: true,
                    repeat: 1,
                    ease: "power2.inOut",
                });
            });
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.flip-card')) {
                document.querySelectorAll('.flip-card-inner.flipped').forEach(inner => {
                    inner.classList.remove('flipped');
                });
            }
        });
    };
    
    initAIShowcase();

    const initAboutUsAnimations = () => {
        gsap.from(".about-us__title", {
            scrollTrigger: {
                trigger: ".about-us__header",
                start: "top 80%",
            },
            y: 80,
            opacity: 0,
            scale: 0.9,
            duration: 1.2,
            ease: "power3.out",
        });

        gsap.from(".about-us__subtitle", {
            scrollTrigger: {
                trigger: ".about-us__header",
                start: "top 80%",
            },
            y: 40,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
            delay: 0.3,
        });

        gsap.utils.toArray(".story-card").forEach((card, i) => {
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                },
                y: 100,
                opacity: 0,
                scale: 0.8,
                duration: 1,
                ease: "back.out(1.7)",
                delay: i * 0.2,
            });
        });

        gsap.from(".team-title", {
            scrollTrigger: {
                trigger: ".team-section",
                start: "top 80%",
            },
            y: 60,
            opacity: 0,
            duration: 1,
            ease: "power3.out",
        });

        gsap.utils.toArray(".team-member").forEach((member, i) => {
            gsap.from(member, {
                scrollTrigger: {
                    trigger: member,
                    start: "top 85%",
                },
                y: 80,
                opacity: 0,
                scale: 0.9,
                duration: 1,
                ease: "back.out(1.7)",
                delay: i * 0.15,
            });
        });

        document.querySelectorAll('.team-member').forEach(member => {
            const card = member.querySelector('.member-card');
            const avatar = member.querySelector('.avatar-placeholder');
            
            member.addEventListener('mouseenter', () => {
                gsap.to(avatar, {
                    rotation: 10,
                    scale: 1.1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
            
            member.addEventListener('mouseleave', () => {
                gsap.to(avatar, {
                    rotation: 0,
                    scale: 1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            });
        });

        gsap.utils.toArray('.floating-shape').forEach((shape, i) => {
            gsap.to(shape, {
                yPercent: -50,
                ease: "none",
                scrollTrigger: {
                    trigger: ".about-us",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    };

    initAboutUsAnimations();

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

    const aiShowcaseHeader = new SplitText(".ai-showcase__header", { type: "lines" });

    gsap.from(aiShowcaseHeader.lines, {
        scrollTrigger: {
            trigger: ".ai-showcase__header",
            start: "top center",
        },
        yPercent: 100,
        opacity: 0,
        scale: 1.05,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
    });

    const aboutUsHeader = new SplitText(".about-us__header", { type: "lines" });

    gsap.from(aboutUsHeader.lines, {
        scrollTrigger: {
            trigger: ".about-us__header",
            start: "top center",
        },
        yPercent: 100,
        opacity: 0,
        scale: 1.05,
        duration: 1.2,
        ease: "power4.out",
        stagger: 0.1,
    });

    const lottieAnimation1 = document.getElementById("lottie-animation-1");
    const lottieAnimation2 = document.getElementById("lottie-animation-2");
    const blocks = document.querySelectorAll(".scroll-sync__text-block");
    let currentAnimation = 'neural-network';
    let isTransitioning = false;

    function showLottieAnimation(animationType) {
        if (animationType === currentAnimation || isTransitioning) {
            return;
        }
        
        isTransitioning = true;
        
        if (currentAnimation === 'neural-network') {
            lottieAnimation1.classList.add('lottie-fade-out');
        } else {
            lottieAnimation2.classList.add('lottie-fade-out');
        }
        
        setTimeout(() => {
            if (animationType === 'neural-network') {
                lottieAnimation2.style.display = 'none';
                lottieAnimation1.style.display = 'block';
                lottieAnimation1.classList.remove('lottie-fade-out');
                lottieAnimation1.classList.add('lottie-fade-in');
            } else if (animationType === 'training-process') {
                lottieAnimation1.style.display = 'none';
                lottieAnimation2.style.display = 'block';
                lottieAnimation2.classList.remove('lottie-fade-out');
                lottieAnimation2.classList.add('lottie-fade-in');
            }
            
            currentAnimation = animationType;
            
            setTimeout(() => {
                isTransitioning = false;
                lottieAnimation1.classList.remove('lottie-fade-in', 'lottie-fade-out');
                lottieAnimation2.classList.remove('lottie-fade-in', 'lottie-fade-out');
            }, 600);
        }, 300);
    }

    lottieAnimation1.style.display = 'block';
    lottieAnimation2.style.display = 'none';
    lottieAnimation1.classList.add('lottie-fade-in');

    blocks.forEach((block, index) => {
        const animationType = block.getAttribute("data-lottie");
        ScrollTrigger.create({
            trigger: block,
            start: "top center+=70",
            end: "bottom center",
            onEnter: () => {
                showLottieAnimation(animationType);
            },
            onEnterBack: () => {
                showLottieAnimation(animationType);
            },
        });
    });

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

    const initFAQSection = () => {
        const faqHeader = new SplitText(".faq__header", { type: "lines" });

        gsap.from(faqHeader.lines, {
            scrollTrigger: {
                trigger: ".faq__header",
                start: "top center",
            },
            yPercent: 100,
            opacity: 0,
            scale: 1.05,
            duration: 1.2,
            ease: "power4.out",
            stagger: 0.1,
        });

        gsap.utils.toArray(".faq__item").forEach((item, i) => {
            gsap.from(item, {
                scrollTrigger: {
                    trigger: item,
                    start: "top 85%",
                },
                y: 60,
                opacity: 0,
                scale: 0.95,
                duration: 1,
                ease: "power3.out",
                delay: i * 0.1,
            });
        });

        document.querySelectorAll('.faq__question').forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.closest('.faq__item');
                const isActive = faqItem.classList.contains('active');
                
                document.querySelectorAll('.faq__item.active').forEach(activeItem => {
                    if (activeItem !== faqItem) {
                        activeItem.classList.remove('active');
                        
                        const toggle = activeItem.querySelector('.faq__toggle');
                        gsap.to(toggle, {
                            rotation: 0,
                            duration: 0.3,
                            ease: "power2.out"
                        });
                    }
                });
                
                if (isActive) {
                    faqItem.classList.remove('active');
                    
                    const toggle = question.querySelector('.faq__toggle');
                    gsap.to(toggle, {
                        rotation: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                } else {
                    faqItem.classList.add('active');
                    
                    const toggle = question.querySelector('.faq__toggle');
                    gsap.to(toggle, {
                        rotation: 45,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                    
                    gsap.to(faqItem, {
                        scale: 1.02,
                        duration: 0.1,
                        yoyo: true,
                        repeat: 1,
                        ease: "power2.inOut"
                    });
                }
            });
        });

        document.querySelectorAll('.faq__item').forEach(item => {
            const question = item.querySelector('.faq__question');
            
            item.addEventListener('mouseenter', () => {
                if (!item.classList.contains('active')) {
                    gsap.to(item, {
                        y: -3,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });
            
            item.addEventListener('mouseleave', () => {
                if (!item.classList.contains('active')) {
                    gsap.to(item, {
                        y: 0,
                        duration: 0.3,
                        ease: "power2.out"
                    });
                }
            });
        });

        gsap.utils.toArray('.faq__shape').forEach((shape, i) => {
            gsap.to(shape, {
                yPercent: -30,
                ease: "none",
                scrollTrigger: {
                    trigger: ".faq",
                    start: "top bottom",
                    end: "bottom top",
                    scrub: true
                }
            });
        });
    };

    initFAQSection();
});

// Typewriter and 3D Card Flip Logic
function initHeroAnimation() {
    const codeSnippet = document.getElementById('typewriter-code');
    const heroCard = document.getElementById('hero-card');
    
    if (!codeSnippet || !heroCard) return;

    const codeLines = [
        "<span class='keyword'>import</span> cv2",
        "<span class='keyword'>import</span> matplotlib.pyplot <span class='keyword'>as</span> plt",
        "",
        "<span class='comment'># Load and render profile</span>",
        "image = cv2.imread(<span class='string'>\"ghaly_profile.png\"</span>)",
        "image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)",
        "",
        "plt.imshow(image)",
        "plt.show()"
    ];

    let currentLine = 0;
    let currentChar = 0;
    let isTag = false;
    let currentHTML = "";

    function typeWriter() {
        if (currentLine < codeLines.length) {
            let lineStr = codeLines[currentLine];
            
            if (currentChar < lineStr.length) {
                let char = lineStr.charAt(currentChar);
                
                if (char === '<') isTag = true;
                
                currentHTML += char;
                currentChar++;
                
                if (char === '>') isTag = false;

                if (isTag) {
                    typeWriter();
                } else {
                    codeSnippet.innerHTML = currentHTML + "<span class='cursor'></span>";
                    setTimeout(typeWriter, Math.random() * 15 + 5); // very fast typing speed
                }
            } else {
                currentHTML += "<br>";
                currentLine++;
                currentChar = 0;
                setTimeout(typeWriter, 50); // fast delay between lines
            }
        } else {
            // Typing finished, remove cursor and flip card
            codeSnippet.innerHTML = currentHTML;
            setTimeout(() => {
                heroCard.classList.add('flipped');
                
                // Allow user to click to toggle back and forth
                heroCard.style.cursor = 'pointer';
                heroCard.onclick = () => {
                    heroCard.classList.toggle('flipped');
                };
            }, 400); // fast flip delay
        }
    }

    // Start typing after a short delay
    setTimeout(typeWriter, 400);
}

// Call initHeroAnimation inside DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
    initHeroAnimation();
    initParticles();
    initMagneticButtons();
    
    // 1. Intersection Observer for Scroll Animations
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Stop observing once animated
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Select all elements with animation classes
    const animatedElements = document.querySelectorAll('.fade-up, .fade-in');
    animatedElements.forEach(el => observer.observe(el));

    // 2. Navbar Scroll Effect (Glassmorphism enhancer)
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(10, 10, 15, 0.8)';
            navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.5)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.03)';
            navbar.style.boxShadow = 'none';
        }
    });

    // 3. Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                // Adjust scroll position considering fixed navbar
                const headerOffset = 80;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
  
                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth"
                });
            }
        });
    });
}); // <--- This was missing

// Modal & Gallery Logic
let currentImages = [];
let currentIndex = 0;

function openProjectGallery(baseName) {
    let images = [];
    let index = 1;
    
    function tryLoadImage() {
        let img = new Image();
        let src = `images/${baseName}_${index}.png`;
        img.onload = function() {
            images.push(src);
            index++;
            tryLoadImage();
        };
        img.onerror = function() {
            // If even the first one fails, try without the _1 suffix
            if (images.length === 0 && index === 1) {
                let fallbackSrc = `images/${baseName}.png`;
                let fallbackImg = new Image();
                fallbackImg.onload = function() {
                    openModal([fallbackSrc]);
                };
                fallbackImg.onerror = function() {
                    // Fallback: open with expected first image to show broken icon and trigger standard behavior
                    openModal([src]); 
                };
                fallbackImg.src = fallbackSrc;
            } else {
                if (images.length > 0) {
                    openModal(images);
                } else {
                    openModal([`images/${baseName}_1.png`]);
                }
            }
        };
        img.src = src;
    }
    
    tryLoadImage();
}

function openModal(images) {
    if (!images || images.length === 0) return;
    
    // Support passing a single string or an array of strings
    currentImages = Array.isArray(images) ? images : [images];
    currentIndex = 0;
    
    const modal = document.getElementById('image-modal');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    
    if (currentImages.length > 1) {
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    } else {
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    }
    
    updateModalImage();
    
    // Display the modal
    modal.style.display = 'block';
    
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
}

function changeSlide(direction) {
    if (currentImages.length <= 1) return;
    
    currentIndex += direction;
    if (currentIndex >= currentImages.length) {
        currentIndex = 0;
    } else if (currentIndex < 0) {
        currentIndex = currentImages.length - 1;
    }
    updateModalImage();
}

function updateModalImage() {
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    
    modalImg.src = currentImages[currentIndex];
    
    if (modalCaption) {
        if (currentImages.length > 1) {
            modalCaption.textContent = `${currentIndex + 1} / ${currentImages.length}`;
            modalCaption.style.display = 'block';
        } else {
            modalCaption.style.display = 'none';
        }
    }
}

// Close Modal Logic
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('image-modal');
    const closeBtn = document.querySelector('.close-modal');

    if (closeBtn) {
        closeBtn.onclick = function() {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    }

    // Close when clicking outside the image or slider
    window.onclick = function(event) {
        if (event.target === modal) {
            modal.style.display = "none";
            document.body.style.overflow = 'auto';
        }
    }
});

// Interactive Particles Background
function initParticles() {
    const canvas = document.getElementById('particles-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    let particles = [];
    
    let mouse = { x: null, y: null, radius: 150 };
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });
    window.addEventListener('mouseout', () => {
        mouse.x = null;
        mouse.y = null;
    });

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        init();
    }
    window.addEventListener('resize', resize);

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 1;
            this.density = (Math.random() * 20) + 1;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
        }
        draw() {
            ctx.fillStyle = 'rgba(0, 240, 255, 0.4)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.closePath();
            ctx.fill();
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            if (this.x < 0 || this.x > width) this.vx = -this.vx;
            if (this.y < 0 || this.y > height) this.vy = -this.vy;

            if (mouse.x != null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    let force = (mouse.radius - distance) / mouse.radius;
                    this.x -= (dx / distance) * force * this.density;
                    this.y -= (dy / distance) * force * this.density;
                }
            }
        }
    }

    function init() {
        particles = [];
        let numberOfParticles = Math.floor((width * height) / 10000);
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        for (let i = 0; i < particles.length; i++) {
            particles[i].update();
            particles[i].draw();
            for (let j = i; j < particles.length; j++) {
                let dx = particles[i].x - particles[j].x;
                let dy = particles[i].y - particles[j].y;
                let distance = dx * dx + dy * dy;
                if (distance < 15000) {
                    let opacity = 1 - (distance/15000);
                    ctx.strokeStyle = `rgba(0, 240, 255, ${opacity * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    resize();
    animate();
}

// Magnetic Buttons
function initMagneticButtons() {
    const magneticElements = document.querySelectorAll('.btn');

    magneticElements.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transition = 'none';
            this.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
        });

        btn.addEventListener('mouseleave', function(e) {
            this.style.transition = 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            this.style.transform = 'translate(0px, 0px)';
        });
    });
}

// Initialize Lucide Icons
lucide.createIcons();

// --- SCROLL REVEAL ANIMATION LOGIC ---
function revealElements() {
    const reveals = document.querySelectorAll('.reveal');
    for (let i = 0; i < reveals.length; i++) {
        const windowHeight = window.innerHeight;
        const elementTop = reveals[i].getBoundingClientRect().top;
        const elementVisible = 100;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
}

window.addEventListener('scroll', revealElements);
document.addEventListener('DOMContentLoaded', revealElements);

// --- SPA NAVIGATION LOGIC ---
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('.nav-links a, .logo');
    const pages = document.querySelectorAll('.page');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-links');

    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('show');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            // Ignore external links (like TAP Journal)
            if (link.classList.contains('external-link')) {
                return; 
            }

            if (link.getAttribute('href') === '#') {
                e.preventDefault();
            }
            
            const targetId = link.getAttribute('data-target');
            if(!targetId) return;

            // Update active nav
            document.querySelectorAll('.nav-links a:not(.external-link)').forEach(a => a.classList.remove('active'));
            if (link.tagName === 'A') {
                link.classList.add('active');
            } else {
                document.querySelector('.nav-links a[data-target="home"]').classList.add('active');
            }

            // Switch pages
            pages.forEach(page => {
                page.classList.remove('active');
            });
            
            const targetPage = document.getElementById(targetId);
            if(targetPage) {
                targetPage.classList.add('active');
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setTimeout(revealElements, 100); 
            }

            if(navMenu.classList.contains('show')) {
                navMenu.classList.remove('show');
            }
        });
    });
});

// --- INTERACTIVE MOUSE CANVAS ANIMATION ---
const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');

let width, height;
let particles = [];
let mouse = { x: null, y: null };

// Track Mouse Movement
window.addEventListener('mousemove', (event) => {
    mouse.x = event.x;
    mouse.y = event.y;
});

window.addEventListener('mouseout', () => {
    mouse.x = undefined;
    mouse.y = undefined;
});

function initCanvas() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    particles = [];
    
    const numParticles = window.innerWidth < 768 ? 50 : 120;
    
    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            size: Math.random() * 2 + 1
        });
    }
}

function drawWaves() {
    ctx.clearRect(0, 0, width, height);
    
    for (let i = 0; i < particles.length; i++) {
        // Connect particles to each other
        for (let j = i; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(143, 188, 143, ${0.4 - distance / 300})`; 
                ctx.lineWidth = 0.5;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }
        
        // Connect particles to mouse
        if (mouse.x && mouse.y) {
            const dxMouse = particles[i].x - mouse.x;
            const dyMouse = particles[i].y - mouse.y;
            const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);
            
            if (distanceMouse < 150) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(218, 165, 32, ${0.6 - distanceMouse / 250})`; 
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
            }
        }
    }
    
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        
        // Bounce off walls
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(218, 165, 32, 0.6)'; 
        ctx.fill();
    });
    
    requestAnimationFrame(drawWaves);
}

window.addEventListener('resize', initCanvas);
initCanvas();
drawWaves();
// Initialize Lucide Icons
lucide.createIcons();

document.getElementById('year').textContent = new Date().getFullYear();

// --- SCROLL REVEAL ANIMATION LOGIC ---
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            revealObserver.unobserve(entry.target);
        }
    });
}, { rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// --- STAT COUNTERS ---
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = Number(el.dataset.count);
        const start = performance.now();
        const duration = 1600;

        function tick(now) {
            const t = Math.min((now - start) / duration, 1);
            el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
            if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
    });
}, { threshold: 0.6 });

document.querySelectorAll('.counter').forEach(el => counterObserver.observe(el));

// --- NAVBAR SHRINK + SCROLL PROGRESS ---
const navbar = document.getElementById('navbar');
const progress = document.querySelector('.scroll-progress');

function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
}
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// --- SPA NAVIGATION LOGIC (hash-based so back/forward and shared links work) ---
const pages = document.querySelectorAll('.page');
const navMenu = document.querySelector('.nav-links');
const hamburger = document.querySelector('.hamburger');
const dropdownItem = document.querySelector('.has-dropdown');
const dropdownToggle = document.querySelector('.dropdown-toggle');
const programPages = ['services', 'performances', 'talks', 'dedications'];

function showPage(id, scroll = true) {
    const target = document.getElementById(id);
    if (!target || !target.classList.contains('page')) id = 'home';

    pages.forEach(page => page.classList.toggle('active', page.id === id));

    document.querySelectorAll('.nav-links a[data-target]').forEach(a => {
        a.classList.toggle('active', a.dataset.target === id);
    });
    dropdownToggle.classList.toggle('active', programPages.includes(id) && id !== 'dedications');

    closeMenu();
    if (scroll) window.scrollTo(0, 0);
    onScroll();
    canvasActive = id === 'home';
    if (canvasActive && width !== hero.offsetWidth) initCanvas();
}

document.addEventListener('click', (e) => {
    const link = e.target.closest('[data-target]');
    if (!link) return;
    e.preventDefault();
    const id = link.dataset.target;
    if (location.hash.slice(1) !== id) history.pushState(null, '', '#' + id);
    showPage(id);
});

window.addEventListener('popstate', () => showPage(location.hash.slice(1) || 'home'));

// --- MOBILE MENU & DROPDOWN ---
function closeMenu() {
    navMenu.classList.remove('show');
    dropdownItem.classList.remove('open');
    dropdownToggle.setAttribute('aria-expanded', 'false');
    hamburger.innerHTML = '<i data-lucide="menu"></i>';
    lucide.createIcons();
}

hamburger.addEventListener('click', () => {
    const open = navMenu.classList.toggle('show');
    hamburger.innerHTML = `<i data-lucide="${open ? 'x' : 'menu'}"></i>`;
    lucide.createIcons();
});

dropdownToggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = dropdownItem.classList.toggle('open');
    dropdownToggle.setAttribute('aria-expanded', String(open));
});

document.addEventListener('click', (e) => {
    if (!e.target.closest('.has-dropdown')) dropdownItem.classList.remove('open');
    if (!e.target.closest('#navbar') && navMenu.classList.contains('show')) closeMenu();
});

// --- DEDICATION FORM (submits in place, shows a thank-you) ---
const form = document.getElementById('dedication-form');
const success = document.querySelector('.form-success');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    button.disabled = true;
    button.textContent = 'Sending...';

    try {
        const res = await fetch(form.action, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: new FormData(form)
        });
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        form.hidden = true;
        success.hidden = false;
    } catch (err) {
        alert('Sorry, something went wrong. Please try again or email theacousticproject.sd@gmail.com.');
    } finally {
        button.disabled = false;
        button.textContent = 'Submit Dedication';
    }
});

document.querySelector('[data-reset-form]').addEventListener('click', () => {
    success.hidden = true;
    form.hidden = false;
});

// --- IMAGE LIGHTBOX ---
const lightbox = document.querySelector('.lightbox');
const lightboxImg = lightbox.querySelector('img');

document.querySelectorAll('[data-lightbox]').forEach(btn => {
    btn.addEventListener('click', () => {
        const img = btn.querySelector('img');
        lightboxImg.src = img.src;
        lightboxImg.alt = img.alt;
        lightbox.hidden = false;
    });
});

lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) lightbox.hidden = true;
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') lightbox.hidden = true;
});

// --- INTERACTIVE MOUSE CANVAS ANIMATION ---
const canvas = document.getElementById('waveCanvas');
const ctx = canvas.getContext('2d');
const hero = document.querySelector('.hero');

let width, height;
let particles = [];
let mouse = { x: null, y: null };
let canvasActive = true;

// Track Mouse Movement (relative to the hero)
hero.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = event.clientX - rect.left;
    mouse.y = event.clientY - rect.top;
});

hero.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
});

function initCanvas() {
    const dpr = window.devicePixelRatio || 1;
    width = hero.offsetWidth;
    height = hero.offsetHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    particles = [];

    const numParticles = width < 768 ? 35 : 80;

    for (let i = 0; i < numParticles; i++) {
        particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1,
            gold: Math.random() < 0.25
        });
    }
}

function drawWaves() {
    requestAnimationFrame(drawWaves);
    if (!canvasActive) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
        // Connect particles to each other
        for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 120) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(100, 128, 122, ${0.22 - distance / 550})`;
                ctx.lineWidth = 0.6;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(particles[j].x, particles[j].y);
                ctx.stroke();
            }
        }

        // Connect particles to mouse, and gently pull them toward it
        if (mouse.x !== null) {
            const dxMouse = mouse.x - particles[i].x;
            const dyMouse = mouse.y - particles[i].y;
            const distanceMouse = Math.sqrt(dxMouse * dxMouse + dyMouse * dyMouse);

            if (distanceMouse < 160) {
                ctx.beginPath();
                ctx.strokeStyle = `rgba(201, 165, 90, ${0.55 - distanceMouse / 320})`;
                ctx.lineWidth = 1;
                ctx.moveTo(particles[i].x, particles[i].y);
                ctx.lineTo(mouse.x, mouse.y);
                ctx.stroke();
                particles[i].x += dxMouse * 0.003;
                particles[i].y += dyMouse * 0.003;
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
        ctx.fillStyle = p.gold ? 'rgba(201, 165, 90, 0.7)' : 'rgba(135, 161, 150, 0.6)';
        ctx.fill();
    });
}

window.addEventListener('resize', initCanvas);

showPage(location.hash.slice(1) || 'home', false);
initCanvas();
drawWaves();

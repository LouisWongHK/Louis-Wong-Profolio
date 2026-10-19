// script.js
document.addEventListener('DOMContentLoaded', () => {
    const root = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = themeToggle.querySelector('.theme-icon');
    const backToTop = document.getElementById('backToTop');
    const navLinks = document.querySelectorAll('#nav a');
    const sections = document.querySelectorAll('main section[id]');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const cards = document.querySelectorAll('.card');
    const form = document.getElementById('contactForm');
    const formNote = document.getElementById('formNote');

    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // --- Theme (respects system preference, remembers choice) ---
    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        themeIcon.textContent = theme === 'dark' ? '☀' : '☾';
    }
    let saved = null;
    try { saved = localStorage.getItem('theme'); } catch (e) { /* storage blocked */ }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved || (prefersDark ? 'dark' : 'light'));

    themeToggle.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next);
        try { localStorage.setItem('theme', next); } catch (e) { /* ignore */ }
    });

    // --- Reveal on scroll ---
    const revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    io.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12 });
        revealEls.forEach(el => io.observe(el));
    } else {
        revealEls.forEach(el => el.classList.add('visible'));
    }

    // --- Animated stat counters ---
    const counters = document.querySelectorAll('[data-count]');
    function runCounter(el) {
        const target = Number(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = 1400;
        const start = performance.now();
        function tick(now) {
            const p = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
            if (p < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
    }
    if ('IntersectionObserver' in window) {
        const co = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    runCounter(entry.target);
                    co.unobserve(entry.target);
                }
            });
        }, { threshold: 0.6 });
        counters.forEach(c => co.observe(c));
    } else {
        counters.forEach(c => { c.textContent = c.dataset.count + (c.dataset.suffix || ''); });
    }

    // --- Active nav link + back to top ---
    function onScroll() {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 160) current = section.id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.getAttribute('href') === '#' + current);
        });
        backToTop.classList.toggle('show', window.scrollY > 400);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

    // --- Work filter ---
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const filter = btn.dataset.filter;
            cards.forEach(card => {
                const cats = card.dataset.category.split(' ');
                card.classList.toggle('hidden', filter !== 'all' && !cats.includes(filter));
            });
        });
    });

    // --- Contact form: opens the visitor's email app with the message filled in ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = form.name.value.trim();
        const email = form.email.value.trim();
        const message = form.message.value.trim();
        if (!name || !email || !message) {
            formNote.textContent = 'Please fill in all fields.';
            return;
        }
        const subject = encodeURIComponent('Portfolio enquiry from ' + name);
        const body = encodeURIComponent(message + '\n\n' + name + '\n' + email);
        window.location.href = 'mailto:LouisWongHK@protonmail.com?subject=' + subject + '&body=' + body;
        formNote.textContent = 'Opening your email app...';
        form.reset();
    });
});
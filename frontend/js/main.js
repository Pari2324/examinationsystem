// main.js — Landing page interactivity

document.addEventListener('DOMContentLoaded', function () {

  // ── LOAD BAR ──
  const bar = document.getElementById('loadBar');
  if (bar) {
    bar.style.width = '70%';
    setTimeout(() => { bar.style.width = '100%'; setTimeout(() => bar.style.opacity = 0, 400); }, 400);
  }

  // ── SCROLL TO TOP ──
  const scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('show', window.scrollY > 300);
    });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── MOBILE BURGER ──
  const burger = document.getElementById('burger');
const nav = document.getElementById('navMenu');

if (burger && nav) {
  burger.addEventListener('click', () => {
    nav.classList.toggle('active');
  });
}

  // ── ANIMATED COUNTER ──
  const counters = document.querySelectorAll('.hstat-n');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.count);
      let current = 0;
      const step = Math.ceil(target / 40);
      const interval = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current;
        if (current >= target) clearInterval(interval);
      }, 30);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  counters.forEach(c => observer.observe(c));

  // ── LOAD FEATURES DYNAMICALLY ──
  const featuresData = [
    { icon: '🔐', title: 'JWT Authentication', desc: 'Secure token-based login with role verification on every request.' },
    { icon: '⏱️', title: 'Timed Exams', desc: 'Countdown timer with auto-submit when time expires. No exceptions.' },
    { icon: '📷', title: 'Webcam Monitoring', desc: 'Live webcam feed ensures the right person is taking the test.' },
    { icon: '🚨', title: 'Tab Switch Detection', desc: 'Automatic warnings and auto-submit after 3 violations detected.' },
    { icon: '📺', title: 'Fullscreen Enforcement', desc: 'Exam runs fullscreen. Exiting triggers an immediate warning.' },
    { icon: '📊', title: 'Instant Results', desc: 'Auto-graded results with score breakdown shown immediately.' },
    { icon: '🛡️', title: 'Violation Tracking', desc: 'Every suspicious event is logged and stored for admin review.' },
    { icon: '🗃️', title: 'Question Bank', desc: 'Admin builds and manages reusable question pools for all exams.' },
    { icon: '📁', title: 'Export Reports', desc: 'Download student results and violation logs as CSV or PDF.' },
  ];

  const grid = document.getElementById('featuresGrid');
  if (grid) {
    featuresData.forEach((f, i) => {
      const card = document.createElement('div');
      card.className = 'feat-card';
      card.style.animationDelay = `${i * 0.05}s`;
      card.innerHTML = `<div class="feat-icon">${f.icon}</div><h3>${f.title}</h3><p>${f.desc}</p>`;
      grid.appendChild(card);
    });
  }

  // ── SMOOTH NAV SCROLL ──
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // ── HEADER SHADOW ON SCROLL ──
  const header = document.getElementById('header');
  if (header) {
    window.addEventListener('scroll', () => {
      header.style.boxShadow = window.scrollY > 10 ? '0 2px 20px rgba(0,0,0,0.4)' : '';
    });
  }
});

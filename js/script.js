// ============================================
// SECURE ONLINE EXAMINATION SYSTEM - WEEK 2
// JavaScript File
// DOM Manipulation & Event Handling
// ============================================

// ========================================
// 1. THEME TOGGLE FUNCTIONALITY
// ========================================
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

// Check for saved theme preference or default to dark mode
const currentTheme = localStorage.getItem('theme') || 'dark';
if (currentTheme === 'light') {
    body.classList.add('light-mode');
    themeToggle.innerHTML = '🌙 Dark Mode';
} else {
    themeToggle.innerHTML = '☀️ Light Mode';
}

// Theme toggle event listener
themeToggle.addEventListener('click', function() {
    body.classList.toggle('light-mode');
    
    // Update button text and save preference
    if (body.classList.contains('light-mode')) {
        themeToggle.innerHTML = '🌙 Dark Mode';
        localStorage.setItem('theme', 'light');
        showToast('Light mode activated! 🌞');
    } else {
        themeToggle.innerHTML = '☀️ Light Mode';
        localStorage.setItem('theme', 'dark');
        showToast('Dark mode activated! 🌙');
    }
});

// ========================================
// 2. SMOOTH SCROLLING FOR NAVIGATION
// ========================================
const navLinks = document.querySelectorAll('.nav-link');

navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const targetSection = document.querySelector(targetId);
        
        if (targetSection) {
            targetSection.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            
            // Close mobile menu if open
            const navMenu = document.getElementById('navMenu');
            navMenu.classList.remove('mobile-menu-open');
        }
    });
});

// ========================================
// 3. SCROLL TO TOP BUTTON
// ========================================
const scrollToTopBtn = document.getElementById('scrollToTop');

window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
        scrollToTopBtn.classList.add('visible');
    } else {
        scrollToTopBtn.classList.remove('visible');
    }
});

scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// ========================================
// 4. MOBILE MENU TOGGLE
// ========================================
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navMenu = document.getElementById('navMenu');

mobileMenuToggle.addEventListener('click', function() {
    navMenu.classList.toggle('mobile-menu-open');
    
    // Change icon
    if (navMenu.classList.contains('mobile-menu-open')) {
        this.innerHTML = '✕';
    } else {
        this.innerHTML = '☰';
    }
});

// ========================================
// 5. DYNAMIC FEATURES LOADING
// ========================================
const featuresData = [
    {
        icon: '🔐',
        title: 'Secure Login System',
        description: 'Multi-layer authentication ensures only authorized users can access the system, protecting exam integrity and student data.'
    },
    {
        icon: '⏱️',
        title: 'Timed Examinations',
        description: 'Automatic time tracking with countdown timers and auto-submission when time expires to ensure fairness for all students.'
    },
    {
        icon: '📊',
        title: 'Instant Results',
        description: 'Automated grading system provides immediate feedback with detailed performance analytics and score breakdowns.'
    },
    {
        icon: '👨‍💼',
        title: 'Admin Control Panel',
        description: 'Comprehensive dashboard for administrators to create exams, manage students, monitor progress, and generate reports.'
    },
    {
        icon: '📝',
        title: 'Question Bank',
        description: 'Extensive library of questions with support for multiple formats including MCQs, true/false, and descriptive answers.'
    },
    {
        icon: '🛡️',
        title: 'Anti-Cheating Measures',
        description: 'Advanced security features including randomized questions, browser restrictions, and activity monitoring to prevent malpractice.'
    },
    {
        icon: '📱',
        title: 'Responsive Design',
        description: 'Fully responsive interface that works seamlessly across all devices - desktop, tablet, and mobile platforms.'
    },
    {
        icon: '💾',
        title: 'Data Backup',
        description: 'Automatic backup systems ensure all exam data, student responses, and results are safely stored and recoverable.'
    }
];

function loadFeatures() {
    const featuresGrid = document.getElementById('featuresGrid');
    const loadingIndicator = document.getElementById('loadingIndicator');
    
    // Show loading indicator
    loadingIndicator.classList.add('active');
    
    // Simulate loading delay
    setTimeout(() => {
        featuresData.forEach((feature, index) => {
            const featureCard = document.createElement('div');
            featureCard.className = 'feature-card';
            featureCard.style.opacity = '0';
            featureCard.innerHTML = `
                <div class="feature-icon">${feature.icon}</div>
                <h3>${feature.title}</h3>
                <p>${feature.description}</p>
            `;
            
            featuresGrid.appendChild(featureCard);
            
            // Animate card appearance
            setTimeout(() => {
                featureCard.style.transition = 'opacity 0.5s ease';
                featureCard.style.opacity = '1';
            }, index * 100);
        });
        
        // Hide loading indicator
        loadingIndicator.classList.remove('active');
        showToast('Features loaded successfully! ✨');
    }, 800);
}

// ========================================
// 6. ANIMATED COUNTER FOR STATS
// ========================================
function animateCounter(element, target, suffix = '') {
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            element.textContent = target + suffix;
            clearInterval(timer);
        } else {
            element.textContent = Math.floor(current) + suffix;
        }
    }, 30);
}

// Intersection Observer for stats animation
const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statItems = document.querySelectorAll('.stat-item');
            statItems.forEach((item, index) => {
                const number = item.querySelector('.stat-number');
                const label = item.querySelector('.stat-label').textContent;
                
                setTimeout(() => {
                    if (label === 'Secure') {
                        animateCounter(number, 100, '%');
                    } else if (label === 'Available') {
                        animateCounter(number, 247, '');
                        setTimeout(() => {
                            number.textContent = '24/7';
                        }, 1500);
                    } else if (label === 'Results') {
                        animateCounter(number, 1, 's');
                        setTimeout(() => {
                            number.textContent = 'Instant';
                        }, 1500);
                    }
                    
                    // Add pulse animation
                    item.classList.add('pulse');
                    setTimeout(() => {
                        item.classList.remove('pulse');
                    }, 2000);
                }, index * 200);
            });
            
            statsObserver.disconnect();
        }
    });
}, { threshold: 0.5 });

const aboutSection = document.querySelector('.about-stats');
if (aboutSection) {
    statsObserver.observe(aboutSection);
}

// ========================================
// 7. TOAST NOTIFICATION SYSTEM
// ========================================
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');
    
    toastMessage.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

function closeToast() {
    document.getElementById('toast').classList.remove('show');
}

// ========================================
// 8. INTERACTIVE BUTTON EFFECTS
// ========================================
const buttons = document.querySelectorAll('.btn');

buttons.forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-2px) scale(1.05)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
    
    button.addEventListener('click', function(e) {
        // Create ripple effect
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);
    });
});

// Add ripple animation
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// 9. PAGE LOAD EVENT
// ========================================
window.addEventListener('DOMContentLoaded', function() {
    // Load features dynamically
    loadFeatures();
    
    // Show welcome toast
    setTimeout(() => {
        showToast('Welcome to ExamSecure! 🎓');
    }, 1000);
    
    // Track page visit
    let visitCount = parseInt(localStorage.getItem('visitCount') || '0');
    visitCount++;
    localStorage.setItem('visitCount', visitCount);
    
    console.log(`Welcome! You've visited ${visitCount} time(s).`);
});

// ========================================
// 10. KEYBOARD SHORTCUTS
// ========================================
document.addEventListener('keydown', function(e) {
    // Press 'T' to toggle theme
    if (e.key === 't' || e.key === 'T') {
        themeToggle.click();
    }
    
    // Press 'Escape' to close mobile menu
    if (e.key === 'Escape') {
        navMenu.classList.remove('mobile-menu-open');
        mobileMenuToggle.innerHTML = '☰';
    }
    
    // Press 'Home' to scroll to top
    if (e.key === 'Home') {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});

// ========================================
// 11. PERFORMANCE TRACKING
// ========================================
window.addEventListener('load', function() {
    const loadTime = window.performance.timing.domContentLoadedEventEnd - 
                   window.performance.timing.navigationStart;
    console.log(`Page loaded in ${loadTime}ms`);
});
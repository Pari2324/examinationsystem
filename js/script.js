document.addEventListener("DOMContentLoaded", function () {

    // ========================
    // THEME TOGGLE
    // ========================
    const themeToggle = document.getElementById('themeToggle');
    const body = document.body;

    if (themeToggle) {
        const currentTheme = localStorage.getItem('theme') || 'dark';

        if (currentTheme === 'light') {
            body.classList.add('light-mode');
            themeToggle.innerHTML = '🌙 Dark Mode';
        } else {
            themeToggle.innerHTML = '☀️ Light Mode';
        }

        themeToggle.addEventListener('click', function () {
            body.classList.toggle('light-mode');

            if (body.classList.contains('light-mode')) {
                themeToggle.innerHTML = '🌙 Dark Mode';
                localStorage.setItem('theme', 'light');
                showToast('Light mode activated!');
            } else {
                themeToggle.innerHTML = '☀️ Light Mode';
                localStorage.setItem('theme', 'dark');
                showToast('Dark mode activated!');
            }
        });
    }

    // ========================
    // SCROLL BUTTON
    // ========================
    const scrollToTopBtn = document.getElementById('scrollToTop');

    if (scrollToTopBtn) {
        window.addEventListener('scroll', function () {
            scrollToTopBtn.classList.toggle('visible', window.pageYOffset > 300);
        });

        scrollToTopBtn.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ========================
    // MOBILE MENU
    // ========================
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navMenu = document.getElementById('navMenu');

    if (mobileMenuToggle && navMenu) {
        mobileMenuToggle.addEventListener('click', function () {
            navMenu.classList.toggle('mobile-menu-open');
            this.innerHTML = navMenu.classList.contains('mobile-menu-open') ? '✕' : '☰';
        });
    }

    // ========================
    // LOAD FEATURES
    // ========================
    function loadFeatures() {
        const featuresGrid = document.getElementById('featuresGrid');
        if (!featuresGrid) return;

        const featuresData = [
            { icon: '🔐', title: 'Secure Login', description: 'Protected access' },
            { icon: '⏱️', title: 'Timed Exams', description: 'Auto submit' },
            { icon: '📊', title: 'Results', description: 'Instant result' }
        ];

        featuresData.forEach(feature => {
            const div = document.createElement('div');
            div.innerHTML = `<h3>${feature.title}</h3><p>${feature.description}</p>`;
            featuresGrid.appendChild(div);
        });
    }

    loadFeatures();

});

// ========================
// TOAST FUNCTION
// ========================
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toastMessage');

    if (toast && toastMessage) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

function closeToast() {
    const toast = document.getElementById('toast');
    if (toast) toast.classList.remove('show');
}
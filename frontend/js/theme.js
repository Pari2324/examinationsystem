// theme.js — Dark/Light mode, persisted via localStorage
(function() {
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') document.documentElement.classList.add('light-init');
})();

document.addEventListener('DOMContentLoaded', function () {
  const btn = document.getElementById('themeBtn');
  const body = document.body;

  // Apply saved theme
  const saved = localStorage.getItem('theme') || 'dark';
  if (saved === 'light') {
    body.classList.add('light');
    if (btn) btn.textContent = '☀️';
  } else {
    if (btn) btn.textContent = '🌙';
  }

  if (btn) {
    btn.addEventListener('click', function () {
      body.classList.toggle('light');
      const isLight = body.classList.contains('light');
      btn.textContent = isLight ? '☀️' : '🌙';
      localStorage.setItem('theme', isLight ? 'light' : 'dark');
      showToast(isLight ? '☀️ Light mode on' : '🌙 Dark mode on');
    });
  }
});

// Global toast function
function showToast(msg, duration = 3000) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  if (!toast || !toastMsg) return;
  toastMsg.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), duration);
}

function closeToast() {
  const toast = document.getElementById('toast');
  if (toast) toast.classList.remove('show');
}

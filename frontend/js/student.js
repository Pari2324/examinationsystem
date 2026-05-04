// student.js — Student dashboard logic

const API = 'https://examinationsystem-w00u.onrender.com/api';

// ── AUTH GUARD ──
function getUser() {
  const u = JSON.parse(localStorage.getItem('user') || 'null');
  if (!u || u.role !== 'student') { window.location.href = 'login.html'; return null; }
  return u;
}
function getToken() { return localStorage.getItem('token') || ''; }
function logout() {
  localStorage.removeItem('token'); localStorage.removeItem('user');
  window.location.href = 'login.html';
}

// ── DEMO DATA (fallback when API is offline) ──
const DEMO_EXAMS = [
  { _id: 'e1', title: 'Computer Networks', subject: 'CN', duration: 60, totalQuestions: 20, startTime: '2024-12-20T09:00:00Z', status: 'active' },
  { _id: 'e2', title: 'Operating Systems', subject: 'OS', duration: 45, totalQuestions: 15, startTime: '2024-12-21T10:00:00Z', status: 'active' },
  { _id: 'e3', title: 'Data Structures', subject: 'DS', duration: 90, totalQuestions: 30, startTime: '2024-12-22T14:00:00Z', status: 'active' },
];
const DEMO_RESULTS = [
  { examTitle: 'Computer Networks', date: '2024-12-15', score: 85, total: 100, duration: '58 min', violations: 0, passed: true },
  { examTitle: 'Database Management', date: '2024-12-10', score: 72, total: 100, duration: '42 min', violations: 1, passed: true },
  { examTitle: 'Web Technologies', date: '2024-12-05', score: 90, total: 100, duration: '35 min', violations: 0, passed: true },
];

document.addEventListener('DOMContentLoaded', function () {
  const user = getUser();
  if (!user) return;

  // ── SET USER INFO ──
  document.getElementById('userName').textContent = user.name || 'Student';
  document.getElementById('userAvatar').textContent = (user.name || 'S')[0].toUpperCase();
  if (document.getElementById('profileName'))  document.getElementById('profileName').value  = user.name  || '';
  if (document.getElementById('profileEmail')) document.getElementById('profileEmail').value = user.email || '';

  // ── PAGE NAV ──
  document.querySelectorAll('.snav-item').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  loadStats();
  loadExams();
  loadResults();
});

function showPage(name) {
  document.querySelectorAll('.dash-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.snav-item').forEach(b => b.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  const btn = document.querySelector(`.snav-item[data-page="${name}"]`);
  if (btn) btn.classList.add('active');

  const titles = { overview: ['Overview', 'Your activity summary'], exams: ['Available Exams', 'Click Start to begin an exam'], results: ['My Results', 'Your exam history'], profile: ['Profile', 'Manage your account'] };
  const [title, desc] = titles[name] || [name, ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageDesc').textContent = desc;
}

// ── LOAD STATS ──
async function loadStats() {
  let results = DEMO_RESULTS;
  try {
    const res = await fetch(`${API}/results/my`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) results = await res.json();
  } catch (_) {}

  const scores = results.map(r => (r.score / r.total) * 100);
  document.getElementById('statAvail').textContent = DEMO_EXAMS.length;
  document.getElementById('statTaken').textContent = results.length;
  document.getElementById('statAvg').textContent = scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) + '%' : '—';
  document.getElementById('statBest').textContent = scores.length ? Math.max(...scores).toFixed(0) + '%' : '—';

  // Recent results table
  const tbody = document.getElementById('recentResultsTbody');
  if (tbody) {
    tbody.innerHTML = results.slice(0,3).map(r => `
      <tr>
        <td>${r.examTitle}</td>
        <td>${r.date}</td>
        <td style="color:var(--accent);font-family:var(--mono)">${r.score}/${r.total}</td>
        <td><span class="badge ${r.passed ? 'badge-ok' : 'badge-danger'}">${r.passed ? 'PASS' : 'FAIL'}</span></td>
      </tr>`).join('') || '<tr><td colspan="4" style="color:var(--text-dim);text-align:center">No results yet.</td></tr>';
  }
}

// ── LOAD EXAMS ──
async function loadExams() {
  let exams = DEMO_EXAMS;
  try {
    const res = await fetch(`${API}/exams`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) exams = await res.json();
  } catch (_) {}

  const container = document.getElementById('examCardsContainer');
  if (!container) return;
  if (!exams.length) { container.innerHTML = '<p style="color:var(--text-dim)">No exams available.</p>'; return; }

  container.innerHTML = exams.map(exam => `
    <div class="exam-card">
      <h3>${exam.title}</h3>
      <div class="exam-meta">
        <span>⏱ ${exam.duration} min</span>
        <span>❓ ${exam.totalQuestions} questions</span>
        <span>📅 ${new Date(exam.startTime).toLocaleDateString()}</span>
      </div>
      <span class="badge badge-ok" style="margin-bottom:16px;display:inline-block">${exam.status.toUpperCase()}</span>
      <button class="btn-primary full" onclick="startExam('${exam._id}', '${exam.title}', ${exam.duration}, ${exam.totalQuestions})">
        Start Exam →
      </button>
    </div>`).join('');
}

// ── LOAD RESULTS ──
async function loadResults() {
  let results = DEMO_RESULTS;
  try {
    const res = await fetch(`${API}/results/my`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) results = await res.json();
  } catch (_) {}

  const tbody = document.getElementById('allResultsTbody');
  if (!tbody) return;
  tbody.innerHTML = results.map(r => `
    <tr>
      <td>${r.examTitle}</td>
      <td>${r.date}</td>
      <td style="font-family:var(--mono);color:var(--accent)">${r.score}/${r.total}</td>
      <td>${r.duration}</td>
      <td style="color:${r.violations > 0 ? 'var(--danger)' : 'var(--accent)'}">${r.violations}</td>
      <td><span class="badge ${r.passed ? 'badge-ok' : 'badge-danger'}">${r.passed ? 'PASS' : 'FAIL'}</span></td>
    </tr>`).join('') || '<tr><td colspan="6" style="color:var(--text-dim);text-align:center">No results yet.</td></tr>';
}

// ── START EXAM ──
function startExam(examId, title, duration, totalQ) {
  if (!confirm(`You are about to start: "${title}"\n\nRules:\n• ${totalQ} questions, ${duration} minutes\n• Webcam monitoring ON\n• Tab switching is monitored\n• Full-screen will be enabled\n\nProceed?`)) return;
  // Store exam info for exam page
  sessionStorage.setItem('examSession', JSON.stringify({ examId, title, duration, totalQ }));
  window.location.href = 'exam.html';
}

// ── SAVE PROFILE ──
function saveProfile() {
  const name = document.getElementById('profileName').value;
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  user.name = name;
  localStorage.setItem('user', JSON.stringify(user));
  document.getElementById('userName').textContent = name;
  document.getElementById('userAvatar').textContent = name[0].toUpperCase();
  showToast('✅ Profile updated!');
}

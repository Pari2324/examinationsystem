// admin.js — Admin dashboard logic

const API = 'http://localhost:5000/api';
let allResults = [];
let qCount = 0;

// ── AUTH GUARD ──
function logout() { localStorage.removeItem('token'); localStorage.removeItem('user'); window.location.href = 'login.html'; }
function getToken() { return localStorage.getItem('token') || ''; }
function getUser() {
  const u = JSON.parse(localStorage.getItem('user') || 'null');
  if (!u || u.role !== 'admin') { window.location.href = 'login.html'; return null; }
  return u;
}

// ── DEMO DATA ──
const DEMO_RESULTS = [
  { student: 'Arjun Sharma',   exam: 'Computer Networks', score: 17, total: 20, pct: 85, violations: 0, submitted: '2024-12-15 09:42', passed: true },
  { student: 'Priya Patel',    exam: 'Operating Systems',  score: 11, total: 15, pct: 73, violations: 2, submitted: '2024-12-14 10:18', passed: true },
  { student: 'Rahul Singh',    exam: 'Data Structures',    score: 8,  total: 30, pct: 27, violations: 3, submitted: '2024-12-13 14:55', passed: false },
  { student: 'Sneha Mehta',    exam: 'Computer Networks',  score: 19, total: 20, pct: 95, violations: 0, submitted: '2024-12-12 11:30', passed: true },
  { student: 'Vikram Joshi',   exam: 'Data Structures',    score: 22, total: 30, pct: 73, violations: 1, submitted: '2024-12-11 15:00', passed: true },
];
const DEMO_EXAMS = [
  { _id: 'e1', title: 'Computer Networks', subject: 'CN', duration: 60, totalQuestions: 20, status: 'active' },
  { _id: 'e2', title: 'Operating Systems',  subject: 'OS', duration: 45, totalQuestions: 15, status: 'active' },
  { _id: 'e3', title: 'Data Structures',    subject: 'DS', duration: 90, totalQuestions: 30, status: 'draft'  },
];
const DEMO_STUDENTS = [
  { name: 'Arjun Sharma',  email: 'arjun@uni.edu',   joined: '2024-09-01', exams: 3, avg: 85, active: true },
  { name: 'Priya Patel',   email: 'priya@uni.edu',   joined: '2024-09-01', exams: 2, avg: 72, active: true },
  { name: 'Rahul Singh',   email: 'rahul@uni.edu',   joined: '2024-09-01', exams: 1, avg: 27, active: false },
  { name: 'Sneha Mehta',   email: 'sneha@uni.edu',   joined: '2024-09-01', exams: 4, avg: 91, active: true },
  { name: 'Vikram Joshi',  email: 'vikram@uni.edu',  joined: '2024-09-01', exams: 2, avg: 73, active: true },
];
const DEMO_VIOLATIONS = [
  { student: 'Rahul Singh',  exam: 'Data Structures',   violation: 'Tab switch detected',   count: 3, time: '2024-12-13 14:22' },
  { student: 'Priya Patel',  exam: 'Operating Systems',  violation: 'Exited fullscreen',      count: 2, time: '2024-12-14 10:05' },
  { student: 'Vikram Joshi', exam: 'Data Structures',    violation: 'Window lost focus',      count: 1, time: '2024-12-11 15:30' },
];
const DEMO_CONTACTS = JSON.parse(localStorage.getItem('contactForms') || '[]').concat([
  { name: 'Test User', email: 'test@uni.edu', role: 'Student', message: 'How do I access my results?', timestamp: '2024-12-10T08:00:00Z' },
]);

// ── INIT ──
document.addEventListener('DOMContentLoaded', async function () {
  const user = getUser();
  if (!user) return;
  document.getElementById('adminName').textContent = user.name || 'Admin';

  document.querySelectorAll('.snav-item').forEach(btn => {
    btn.addEventListener('click', () => showPage(btn.dataset.page));
  });

  loadOverview();
  loadExams();
  loadResults();
  loadViolations();
  loadContacts();
  loadStudents();
});

function showPage(name) {
  document.querySelectorAll('.dash-page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.snav-item').forEach(b => b.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  const btn = document.querySelector(`.snav-item[data-page="${name}"]`);
  if (btn) btn.classList.add('active');
  const titles = {
    overview: ['Overview', 'System summary and live stats'],
    exams: ['Manage Exams', 'View, edit and publish exams'],
    'create-exam': ['Create Exam', 'Build a new examination'],
    results: ['Results', 'All student submissions'],
    violations: ['Violations', 'Anti-cheating activity log'],
    contacts: ['Contact Forms', 'Incoming messages'],
    students: ['Students', 'Manage student accounts'],
  };
  const [title, desc] = titles[name] || [name, ''];
  document.getElementById('pageTitle').textContent = title;
  document.getElementById('pageDesc').textContent = desc;
}

// ── LOAD OVERVIEW ──
async function loadOverview() {
  document.getElementById('st-students').textContent = DEMO_STUDENTS.length;
  document.getElementById('st-exams').textContent = DEMO_EXAMS.filter(e => e.status === 'active').length;
  document.getElementById('st-subs').textContent = DEMO_RESULTS.length;
  document.getElementById('st-vios').textContent = DEMO_VIOLATIONS.reduce((a,v) => a + v.count, 0);

  const tbody = document.getElementById('recentSubsTbody');
  if (tbody) {
    tbody.innerHTML = DEMO_RESULTS.slice(0,5).map(r => `
      <tr>
        <td>${r.student}</td>
        <td>${r.exam}</td>
        <td style="font-family:var(--mono)">${r.score}/${r.total}</td>
        <td style="color:${r.violations>0?'var(--danger)':'var(--accent)'}">${r.violations}</td>
        <td style="color:var(--text-dim)">${r.submitted}</td>
        <td><span class="badge ${r.passed?'badge-ok':'badge-danger'}">${r.passed?'PASS':'FAIL'}</span></td>
      </tr>`).join('');
  }
}

// ── LOAD EXAMS ──
async function loadExams() {
  let exams = DEMO_EXAMS;
  try {
    const res = await fetch(`${API}/exams`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) exams = await res.json();
  } catch (_) {}

  const tbody = document.getElementById('examsTbody');
  if (!tbody) return;
  tbody.innerHTML = exams.map(e => `
    <tr>
      <td><strong>${e.title}</strong></td>
      <td>${e.subject}</td>
      <td>${e.duration} min</td>
      <td>${e.totalQuestions}</td>
      <td><span class="badge ${e.status==='active'?'badge-ok':'badge-warn'}">${e.status.toUpperCase()}</span></td>
      <td>
        <button class="btn-ghost" style="padding:4px 10px;font-size:12px" onclick="showToast('Edit coming soon')">Edit</button>
        <button class="btn-ghost" style="padding:4px 10px;font-size:12px;color:var(--danger)" onclick="showToast('Delete: '+\'${e.title}\')">Delete</button>
      </td>
    </tr>`).join('');
}

// ── LOAD RESULTS ──
async function loadResults() {
  allResults = DEMO_RESULTS;
  try {
    const res = await fetch(`${API}/results`, { headers: { Authorization: `Bearer ${getToken()}` } });
    if (res.ok) allResults = await res.json();
  } catch (_) {}
  renderResults(allResults);
}

function renderResults(data) {
  const tbody = document.getElementById('resultsTbody');
  if (!tbody) return;
  tbody.innerHTML = data.map(r => `
    <tr>
      <td>${r.student}</td>
      <td>${r.exam}</td>
      <td style="font-family:var(--mono)">${r.score}/${r.total}</td>
      <td style="font-family:var(--mono)">${r.pct}%</td>
      <td style="color:${r.violations>0?'var(--danger)':'var(--text-dim)'}">${r.violations}</td>
      <td style="color:var(--text-dim)">${r.submitted}</td>
      <td><span class="badge ${r.passed?'badge-ok':'badge-danger'}">${r.passed?'PASS':'FAIL'}</span></td>
    </tr>`).join('');
}

function filterResults() {
  const q = document.getElementById('filterStudent').value.toLowerCase();
  renderResults(allResults.filter(r => r.student.toLowerCase().includes(q) || r.exam.toLowerCase().includes(q)));
}

function exportCSV() {
  const header = ['Student','Exam','Score','Total','%','Violations','Submitted','Status'];
  const rows = allResults.map(r => [r.student, r.exam, r.score, r.total, r.pct, r.violations, r.submitted, r.passed?'PASS':'FAIL']);
  const csv = [header, ...rows].map(row => row.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'exam_results.csv';
  a.click();
  showToast('✅ CSV exported!');
}

// ── LOAD VIOLATIONS ──
function loadViolations() {
  const tbody = document.getElementById('vioTbody');
  if (!tbody) return;
  tbody.innerHTML = DEMO_VIOLATIONS.map(v => `
    <tr>
      <td>${v.student}</td>
      <td>${v.exam}</td>
      <td style="color:var(--danger)">${v.violation}</td>
      <td><span class="badge badge-danger">${v.count}</span></td>
      <td style="color:var(--text-dim)">${v.time}</td>
      <td><button class="btn-ghost" style="padding:4px 10px;font-size:12px" onclick="showToast('Flagged for review')">Review</button></td>
    </tr>`).join('');
}

// ── LOAD CONTACTS ──
function loadContacts() {
  const tbody = document.getElementById('contactsTbody');
  if (!tbody) return;
  tbody.innerHTML = DEMO_CONTACTS.map(c => `
    <tr>
      <td>${c.name}</td>
      <td><a href="mailto:${c.email}" style="color:var(--accent)">${c.email}</a></td>
      <td><span class="badge badge-info">${c.role}</span></td>
      <td style="max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${c.message}</td>
      <td style="color:var(--text-dim)">${new Date(c.timestamp).toLocaleDateString()}</td>
    </tr>`).join('');
}

// ── LOAD STUDENTS ──
function loadStudents() {
  const tbody = document.getElementById('studentsTbody');
  if (!tbody) return;
  tbody.innerHTML = DEMO_STUDENTS.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.email}</td>
      <td style="color:var(--text-dim)">${s.joined}</td>
      <td>${s.exams}</td>
      <td style="font-family:var(--mono);color:var(--accent)">${s.avg}%</td>
      <td><span class="badge ${s.active?'badge-ok':'badge-warn'}">${s.active?'ACTIVE':'SUSPENDED'}</span></td>
    </tr>`).join('');
}

// ── CREATE EXAM ──
function addQuestion() {
  qCount++;
  const id = qCount;
  const container = document.getElementById('questionsContainer');
  const div = document.createElement('div');
  div.id = `q-block-${id}`;
  div.style.cssText = 'background:var(--bg3);border:1px solid var(--border);border-radius:10px;padding:18px;margin-bottom:14px';
  div.innerHTML = `
    <div style="display:flex;justify-content:space-between;margin-bottom:12px">
      <strong style="font-family:var(--mono);font-size:13px">Question ${id}</strong>
      <button class="btn-ghost" style="padding:2px 8px;font-size:12px" onclick="removeQ(${id})">Remove</button>
    </div>
    <div class="fg" style="margin-bottom:10px">
      <label>Question Text</label>
      <input id="qt-${id}" placeholder="Enter question…"/>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px">
      <div class="fg"><label>Option A</label><input id="qa-${id}" placeholder="Option A"/></div>
      <div class="fg"><label>Option B</label><input id="qb-${id}" placeholder="Option B"/></div>
      <div class="fg"><label>Option C</label><input id="qc-${id}" placeholder="Option C"/></div>
      <div class="fg"><label>Option D</label><input id="qd-${id}" placeholder="Option D"/></div>
    </div>
    <div class="fg">
      <label>Correct Answer</label>
      <select id="qcorr-${id}">
        <option value="0">A</option><option value="1">B</option>
        <option value="2">C</option><option value="3">D</option>
      </select>
    </div>`;
  container.appendChild(div);
}

function removeQ(id) {
  const el = document.getElementById(`q-block-${id}`);
  if (el) el.remove();
}

async function saveExam() {
  const title = document.getElementById('newTitle').value.trim();
  const subject = document.getElementById('newSubject').value.trim();
  const duration = parseInt(document.getElementById('newDuration').value);
  if (!title || !subject || !duration) { showToast('❌ Fill required fields'); return; }

  const questions = [];
  for (let i = 1; i <= qCount; i++) {
    const qt = document.getElementById(`qt-${i}`);
    if (!qt) continue;
    questions.push({
      text: qt.value,
      options: [
        document.getElementById(`qa-${i}`).value,
        document.getElementById(`qb-${i}`).value,
        document.getElementById(`qc-${i}`).value,
        document.getElementById(`qd-${i}`).value,
      ],
      correct: parseInt(document.getElementById(`qcorr-${i}`).value),
    });
  }

  const payload = {
    title, subject, duration,
    passMark: parseInt(document.getElementById('newPass').value) || 40,
    startTime: document.getElementById('newStart').value,
    endTime: document.getElementById('newEnd').value,
    instructions: document.getElementById('newInstructions').value,
    questions,
  };

  try {
    const res = await fetch(`${API}/exams`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      body: JSON.stringify(payload),
    });
    if (res.ok) {
      showToast('✅ Exam created!');
      DEMO_EXAMS.push({ _id: Date.now().toString(), title, subject, duration, totalQuestions: questions.length, status: 'active' });
      showPage('exams'); loadExams();
    } else throw new Error();
  } catch (_) {
    showToast('✅ Exam saved locally (API offline)');
    DEMO_EXAMS.push({ _id: Date.now().toString(), title, subject, duration, totalQuestions: questions.length, status: 'active' });
    showPage('exams'); loadExams();
  }
}

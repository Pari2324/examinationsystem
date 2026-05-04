// exam.js — Full exam engine with anti-cheating system

const API = 'https://examinationsystem-w00u.onrender.com/api';

// ── STATE ──
let exam = null;
let questions = [];
let currentQ = 0;
let answers = {};
let violations = 0;
let MAX_VIOLATIONS = 3;
let timerInterval = null;
let timeLeft = 0; // seconds
let examStartTime = Date.now();
let webcamStream = null;
let screenshotInterval = null;
let violationLog = [];
let isSubmitted = false;

// ── DEMO QUESTIONS ──
const DEMO_QUESTIONS = [
  { _id: 'q1', text: 'Which protocol is used for secure HTTP communication?', options: ['HTTP', 'HTTPS', 'FTP', 'SMTP'], correct: 1 },
  { _id: 'q2', text: 'What does CPU stand for?', options: ['Central Processing Unit', 'Computer Personal Unit', 'Core Processing Unit', 'Central Program Utility'], correct: 0 },
  { _id: 'q3', text: 'Which data structure uses LIFO order?', options: ['Queue', 'Array', 'Stack', 'Linked List'], correct: 2 },
  { _id: 'q4', text: 'What is the time complexity of binary search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], correct: 2 },
  { _id: 'q5', text: 'Which layer of the OSI model handles routing?', options: ['Physical', 'Data Link', 'Network', 'Transport'], correct: 2 },
  { _id: 'q6', text: 'What does RAM stand for?', options: ['Read Access Memory', 'Random Access Memory', 'Rapid Access Module', 'Read And Modify'], correct: 1 },
  { _id: 'q7', text: 'Which sorting algorithm has worst-case O(n log n)?', options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'], correct: 2 },
  { _id: 'q8', text: 'What is the default port for HTTP?', options: ['21', '443', '80', '8080'], correct: 2 },
  { _id: 'q9', text: 'Which keyword declares a constant in JavaScript?', options: ['var', 'let', 'const', 'fixed'], correct: 2 },
  { _id: 'q10', text: 'What does SQL stand for?', options: ['Standard Query Language', 'Structured Query Language', 'Simple Query Logic', 'System Query Layer'], correct: 1 },
];

// ── INIT ──
document.addEventListener('DOMContentLoaded', async function () {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  if (!user) { window.location.href = 'login.html'; return; }

  const sessionData = JSON.parse(sessionStorage.getItem('examSession') || 'null');
  if (!sessionData) { window.location.href = 'student.html'; return; }

  exam = sessionData;
  timeLeft = exam.duration * 60;
  document.getElementById('examTitleBar').textContent = exam.title;

  // Load questions from API or use demo
  try {
    const res = await fetch(`${API}/exams/${exam.examId}/questions`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) questions = await res.json();
    else throw new Error();
  } catch (_) {
    questions = DEMO_QUESTIONS;
  }

  renderQGrid();
  renderQuestion();
  startTimer();
  initWebcam();
  initAntiCheating();
  enterFullscreen();

  showToast('🔒 Exam started. Good luck!');
});

// ── RENDER QUESTION ──
function renderQuestion() {
  const q = questions[currentQ];
  document.getElementById('qNum').textContent = `Question ${currentQ + 1} of ${questions.length}`;
  document.getElementById('qText').textContent = q.text;
  document.getElementById('prevBtn').disabled = currentQ === 0;
  document.getElementById('nextBtn').textContent = currentQ === questions.length - 1 ? 'Review →' : 'Next →';

  const list = document.getElementById('optionsList');
  list.innerHTML = q.options.map((opt, i) => `
    <div class="opt-item ${answers[q._id] === i ? 'selected' : ''}" onclick="selectOption(${i})">
      <div class="opt-label">${String.fromCharCode(65 + i)}</div>
      <span>${opt}</span>
    </div>`).join('');

  updateQGrid();
}

function selectOption(idx) {
  const q = questions[currentQ];
  answers[q._id] = idx;
  renderQuestion();
}

function prevQ() { if (currentQ > 0) { currentQ--; renderQuestion(); } }
function nextQ() {
  if (currentQ < questions.length - 1) { currentQ++; renderQuestion(); }
  else { confirmSubmit(); }
}

// ── QUESTION GRID ──
function renderQGrid() {
  const grid = document.getElementById('qGrid');
  grid.innerHTML = questions.map((q, i) => `
    <button class="q-btn ${i === currentQ ? 'current' : ''} ${answers[q._id] !== undefined ? 'answered' : ''}"
      onclick="goToQ(${i})">${i + 1}</button>`).join('');
}
function updateQGrid() { renderQGrid(); }
function goToQ(i) { currentQ = i; renderQuestion(); }

// ── TIMER ──
function startTimer() {
  timerInterval = setInterval(() => {
    timeLeft--;
    if (timeLeft <= 0) { clearInterval(timerInterval); autoSubmit('Time expired'); return; }

    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    const el = document.getElementById('examTimer');
    el.textContent = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    if (timeLeft <= 300) el.classList.add('danger'); // last 5 min
  }, 1000);
}

// ── ANTI-CHEATING: TAB SWITCH ──
function initAntiCheating() {
  // Tab visibility change
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && !isSubmitted) recordViolation('Tab switch detected');
  });

  // Window blur (another app focused)
  window.addEventListener('blur', () => {
    if (!isSubmitted) recordViolation('Window lost focus');
  });

  // Fullscreen exit
  document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement && !isSubmitted) recordViolation('Exited fullscreen');
  });

  // Copy/paste prevention
  document.addEventListener('copy',  e => { e.preventDefault(); showToast('⚠️ Copy disabled during exam'); });
  document.addEventListener('paste', e => { e.preventDefault(); showToast('⚠️ Paste disabled during exam'); });
  document.addEventListener('contextmenu', e => { e.preventDefault(); });

  // Right-click + devtools prevention
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && ['c','v','a','u'].includes(e.key.toLowerCase())) e.preventDefault();
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && e.key === 'I')) {
      e.preventDefault(); recordViolation('DevTools shortcut detected');
    }
  });
}

function recordViolation(reason) {
  violations++;
  const timestamp = new Date().toLocaleTimeString();
  const entry = `[${timestamp}] ${reason}`;
  violationLog.push(entry);

  // Update log display
  const logEl = document.getElementById('vioLog');
  logEl.innerHTML = violationLog.map(v => `<div class="vlog-item">⚠ ${v}</div>`).join('');
  logEl.scrollTop = logEl.scrollHeight;

  // Update counter
  document.getElementById('vioIndicator').textContent = `Violations: ${violations}/${MAX_VIOLATIONS}`;

  // Show overlay
  const overlay = document.getElementById('violationOverlay');
  document.getElementById('vioTitle').textContent = violations >= MAX_VIOLATIONS ? '🚫 Exam Terminated' : '⚠️ Warning!';
  document.getElementById('vioMsg').textContent = reason;
  document.getElementById('vioCount').textContent = violations >= MAX_VIOLATIONS
    ? 'Maximum violations reached. Exam auto-submitted.'
    : `Warning ${violations} of ${MAX_VIOLATIONS}. Another violation will submit your exam.`;
  overlay.classList.add('show');

  showToast(`⚠️ Violation: ${reason}`);

  if (violations >= MAX_VIOLATIONS) {
    setTimeout(() => autoSubmit('Too many violations'), 3000);
  }

  // Screenshot capture (if webcam active)
  captureSnapshot(reason);
}

function dismissViolation() {
  if (violations < MAX_VIOLATIONS) {
    document.getElementById('violationOverlay').classList.remove('show');
    enterFullscreen();
  }
}

// ── FULLSCREEN ──
function enterFullscreen() {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
}

// ── WEBCAM ──
async function initWebcam() {
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
    const video = document.getElementById('webcamVideo');
    video.srcObject = webcamStream;
    video.style.display = 'block';
    document.getElementById('camPlaceholder').style.display = 'none';
    document.getElementById('camStatus').textContent = '● Camera: Active';
    document.getElementById('camStatus').style.color = 'var(--accent)';

    // Periodic snapshot every 30 seconds
    screenshotInterval = setInterval(() => captureSnapshot('Periodic check'), 30000);
  } catch (err) {
    document.getElementById('camPlaceholder').innerHTML = '📷<br>Camera access denied';
    document.getElementById('camStatus').textContent = 'Camera: Denied';
    recordViolation('Camera access denied');
  }
}

function captureSnapshot(reason) {
  if (!webcamStream) return;
  const video = document.getElementById('webcamVideo');
  const canvas = document.createElement('canvas');
  canvas.width = 160; canvas.height = 120;
  const ctx = canvas.getContext('2d');
  try {
    ctx.drawImage(video, 0, 0, 160, 120);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
    // Store snapshot with violation context
    const snapshots = JSON.parse(sessionStorage.getItem('snapshots') || '[]');
    snapshots.push({ reason, time: new Date().toISOString(), image: dataUrl.substring(0, 100) + '…' });
    sessionStorage.setItem('snapshots', JSON.stringify(snapshots.slice(-20)));
  } catch (_) {}
}

// ── SUBMIT ──
function confirmSubmit() {
  const answered = Object.keys(answers).length;
  const total = questions.length;
  if (answered < total) {
    if (!confirm(`You have answered ${answered}/${total} questions.\n\nAre you sure you want to submit?`)) return;
  }
  autoSubmit('Manual submission');
}

async function autoSubmit(reason) {
  if (isSubmitted) return;
  isSubmitted = true;
  clearInterval(timerInterval);
  clearInterval(screenshotInterval);
  if (webcamStream) webcamStream.getTracks().forEach(t => t.stop());
  if (document.exitFullscreen) document.exitFullscreen();

  // Calculate score
  let score = 0;
  questions.forEach(q => {
    if (answers[q._id] !== undefined && answers[q._id] === q.correct) score++;
  });

  const timeTaken = Math.round((Date.now() - examStartTime) / 1000);
  const result = {
    examId: exam.examId,
    examTitle: exam.title,
    score,
    total: questions.length,
    percentage: Math.round((score / questions.length) * 100),
    violations,
    violationLog,
    timeTaken,
    submittedAt: new Date().toISOString(),
    reason,
    answers,
  };

  // Try to save to API
  try {
    await fetch(`${API}/results/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify(result),
    });
  } catch (_) {}

  // Save locally too
  sessionStorage.setItem('lastResult', JSON.stringify(result));
  window.location.href = 'result.html';
}

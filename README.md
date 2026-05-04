# ExamSecure — Secure Online Examination System
### Web Technology PBL Project | Full-Stack | Node.js + MongoDB + Vanilla JS

---

## Project Structure

```
examsecure/
├── frontend/
│   ├── index.html              ← Landing page
│   ├── css/
│   │   └── style.css           ← All styles (dark/light theme)
│   ├── js/
│   │   ├── theme.js            ← Dark/light toggle (localStorage)
│   │   ├── main.js             ← Landing page interactions
│   │   ├── validation.js       ← Contact form validation
│   │   ├── student.js          ← Student dashboard logic
│   │   ├── admin.js            ← Admin dashboard logic
│   │   └── exam.js             ← Exam engine + anti-cheating
│   └── pages/
│       ├── login.html          ← Login (student + admin tabs)
│       ├── student.html        ← Student dashboard
│       ├── admin.html          ← Admin dashboard
│       ├── exam.html           ← Exam interface (proctored)
│       └── result.html         ← Result display
│
└── backend/
    ├── server.js               ← Express app entry point
    ├── package.json
    ├── .env                    ← Environment variables
    ├── config/
    │   ├── jwt.js              ← Token generation/verification
    │   └── seeder.js           ← Demo data seeder
    ├── middleware/
    │   ├── auth.js             ← JWT protect + role guard
    │   └── validate.js         ← express-validator rules
    ├── models/
    │   ├── User.js             ← Users (student/admin)
    │   ├── Exam.js             ← Exams + embedded questions
    │   ├── Result.js           ← Submissions + violation log
    │   └── Contact.js          ← Contact form messages
    ├── controllers/
    │   ├── authController.js
    │   ├── examController.js
    │   ├── resultController.js
    │   ├── contactController.js
    │   └── userController.js
    └── routes/
        ├── auth.js
        ├── exams.js
        ├── results.js
        ├── contact.js
        └── users.js
```

---

## Setup Instructions

### Prerequisites
- Node.js v18+ → https://nodejs.org
- MongoDB Community → https://www.mongodb.com/try/download/community
- VS Code (recommended) + Live Server extension

---

### Step 1 — Start MongoDB

**Windows:**
```bash
mongod --dbpath C:\data\db
```
**Mac/Linux:**
```bash
mongod
```
Leave this terminal running.

---

### Step 2 — Install Backend Dependencies

```bash
cd examsecure/backend
npm install
```

---

### Step 3 — Configure Environment

The `.env` file is already included with defaults:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/examsecure
JWT_SECRET=examsecure_super_secret_key_change_in_production_2024
JWT_EXPIRES_IN=7d
```
Change `JWT_SECRET` to a random string before deploying.

---

### Step 4 — Seed Demo Data

```bash
npm run seed
```

This creates:
- Admin account: `admin@demo.com` / `admin123`
- Student account: `student@demo.com` / `student123`
- 3 sample exams with 10 questions each
- 1 sample contact message

---

### Step 5 — Start the Backend Server

```bash
npm run dev       # with auto-restart (nodemon)
# or
npm start         # production
```

Server starts at: `http://localhost:5000`
Health check: `http://localhost:5000/api/health`

---

### Step 6 — Open the Frontend

Open `frontend/index.html` using **VS Code Live Server** (right-click → Open with Live Server), or any static file server:

```bash
# Python alternative:
cd examsecure/frontend
python -m http.server 5500
```

Then visit: `http://localhost:5500`

> **Note:** The frontend works in demo mode even without the backend running. All data falls back to localStorage.

---

## API Endpoints

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Protected | Get logged-in user |

### Exams
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/exams` | Student/Admin | List exams |
| POST | `/api/exams` | Admin | Create exam |
| GET | `/api/exams/:id` | Student/Admin | Exam detail |
| GET | `/api/exams/:id/questions` | Student | Questions (no answers) |
| PATCH | `/api/exams/:id` | Admin | Update exam |
| DELETE | `/api/exams/:id` | Admin | Delete exam |

### Results
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/results/submit` | Student | Submit exam answers |
| GET | `/api/results/my` | Student | My results |
| GET | `/api/results` | Admin | All results |
| GET | `/api/results/violations` | Admin | Flagged results |
| GET | `/api/results/stats` | Admin | Aggregate stats |

### Contact
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/contact` | Public | Submit contact form |
| GET | `/api/contact` | Admin | View all messages |
| PATCH | `/api/contact/:id/status` | Admin | Mark read/replied |

### Users
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users` | Admin | All users + stats |
| PATCH | `/api/users/me` | Any | Update own profile |
| PATCH | `/api/users/:id/status` | Admin | Suspend/activate |
| DELETE | `/api/users/:id` | Admin | Delete user |

---

## Anti-Cheating Features Explained

### 1. Tab Switch Detection
```js
document.addEventListener('visibilitychange', () => {
  if (document.hidden) recordViolation('Tab switch detected');
});
```
Every tab switch is timestamped and stored. After 3 violations → auto-submit.

### 2. Window Blur Detection
```js
window.addEventListener('blur', () => recordViolation('Window lost focus'));
```
Catches alt-tab, clicking another app, or opening DevTools.

### 3. Fullscreen Enforcement
```js
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement) recordViolation('Exited fullscreen');
});
```
Exam forces fullscreen on start. Exiting triggers a warning overlay.

### 4. Webcam Monitoring
Uses `navigator.mediaDevices.getUserMedia()`. Live feed shown in exam sidebar. Periodic JPEG snapshots captured every 30 seconds and at each violation event.

### 5. Copy/Paste/Right-click Disabled
```js
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('contextmenu', e => e.preventDefault());
```

### 6. DevTools Shortcut Block
F12 and Ctrl+Shift+I are intercepted and logged as violations.

### 7. Suspicious Submission Flag (Backend)
The backend auto-flags results where:
- Violations ≥ 2, OR
- Time taken < 10% of exam duration (abnormally fast)

These appear highlighted in the admin violations panel.

---

## MongoDB Collections

### users
```json
{ "name": "...", "email": "...", "password": "<bcrypt>",
  "role": "student|admin", "rollNumber": "...", "isActive": true }
```

### exams
```json
{ "title": "...", "subject": "...", "duration": 60,
  "questions": [{ "text": "...", "options": [...], "correct": 0 }],
  "status": "draft|active|closed", "createdBy": "<userId>" }
```

### results
```json
{ "student": "<userId>", "exam": "<examId>",
  "score": 8, "total": 10, "percentage": 80, "passed": true,
  "violations": 1, "violationLog": ["[09:42] Tab switch"],
  "timeTaken": 2340, "suspicious": false }
```

### contacts
```json
{ "name": "...", "email": "...", "phone": "...",
  "role": "Student", "message": "...", "status": "new|read|replied" }
```

---

## How to Test

1. **Landing page** → `http://localhost:5500`
2. **Login as student** → `student@demo.com` / `student123`
3. Student dashboard → click any exam → **Start Exam**
4. Try switching tabs → observe violation warning
5. Answer questions → click **Submit Exam** → see result
6. **Login as admin** → `admin@demo.com` / `admin123`
7. Admin dashboard → Results → see student submission with violation count
8. Admin → Create Exam → fill form → add questions → Save
9. Admin → Contact Forms → see incoming messages

---


*ExamSecure — Web Technology PBL | Academic Project 2026*

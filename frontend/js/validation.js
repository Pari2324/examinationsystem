// validation.js — Contact form real-time validation

document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('contactForm');
  if (!form) return;

  // ── FIELD REFS ──
  const fields = {
    name:    { el: document.getElementById('name'),    err: document.getElementById('nameErr') },
    email:   { el: document.getElementById('email'),   err: document.getElementById('emailErr') },
    phone:   { el: document.getElementById('phone'),   err: document.getElementById('phoneErr') },
    role:    { el: document.getElementById('role'),    err: document.getElementById('roleErr') },
    message: { el: document.getElementById('message'), err: document.getElementById('msgErr') },
    terms:   { el: document.getElementById('terms'),   err: document.getElementById('termsErr') },
  };

  // ── VALIDATORS ──
  const validators = {
    name(v)    { if (!v) return 'Name is required'; if (v.length < 3) return 'Min 3 characters'; if (!/^[a-zA-Z\s]+$/.test(v)) return 'Letters only'; return ''; },
    email(v)   { if (!v) return 'Email is required'; if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Invalid email'; return ''; },
    phone(v)   { if (!v) return 'Phone is required'; if (!/^[\d\s\+\-\(\)]{7,15}$/.test(v)) return 'Invalid phone'; return ''; },
    role(v)    { if (!v) return 'Please select a role'; return ''; },
    message(v) { if (!v) return 'Message is required'; if (v.length < 10) return 'Min 10 characters'; return ''; },
    terms(v)   { if (!v) return 'You must accept terms'; return ''; },
  };

  function validate(key, value) {
    const { el, err } = fields[key];
    if (!el || !err) return true;
    const msg = validators[key](value);
    if (msg) {
      el.classList.add('has-error'); el.classList.remove('has-ok');
      err.textContent = msg;
      return false;
    } else {
      el.classList.remove('has-error'); el.classList.add('has-ok');
      err.textContent = '';
      return true;
    }
  }

  // ── REAL-TIME EVENTS ──
  Object.keys(fields).forEach(key => {
    const { el } = fields[key];
    if (!el) return;
    const event = key === 'role' ? 'change' : (key === 'terms' ? 'change' : 'blur');
    el.addEventListener(event, () => {
      const val = key === 'terms' ? el.checked : el.value.trim();
      validate(key, val);
    });
  });

  // ── SUBMIT ──
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    const results = [
      validate('name', fields.name.el.value.trim()),
      validate('email', fields.email.el.value.trim()),
      validate('phone', fields.phone.el.value.trim()),
      validate('role', fields.role.el.value),
      validate('message', fields.message.el.value.trim()),
      validate('terms', fields.terms.el.checked),
    ];

    const status = document.getElementById('formStatus');
    if (!results.every(Boolean)) {
      if (status) { status.className = 'form-status fail'; status.textContent = '❌ Please fix the errors above.'; }
      showToast('Please fix form errors');
      return;
    }

    const submitBtn = document.getElementById('submitBtn');
    if (submitBtn) { submitBtn.textContent = 'Sending…'; submitBtn.disabled = true; }

    const payload = {
      name:    fields.name.el.value.trim(),
      email:   fields.email.el.value.trim(),
      phone:   fields.phone.el.value.trim(),
      role:    fields.role.el.value,
      message: fields.message.el.value.trim(),
    };

    try {
      const res = await fetch('http://localhost:5000/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok) {
        if (status) { status.className = 'form-status ok'; status.textContent = '✅ Message sent! We\'ll get back to you soon.'; }
        showToast('✅ Message sent successfully!');
        form.reset();
        Object.values(fields).forEach(({ el }) => { if (el) { el.classList.remove('has-ok', 'has-error'); } });
      } else {
        throw new Error(data.message || 'Server error');
      }
    } catch (err) {
      // Fallback: save locally if API is down
      const saved = JSON.parse(localStorage.getItem('contactForms') || '[]');
      saved.push({ ...payload, timestamp: new Date().toISOString() });
      localStorage.setItem('contactForms', JSON.stringify(saved));
      if (status) { status.className = 'form-status ok'; status.textContent = '✅ Message saved locally (server offline).'; }
      showToast('📋 Saved locally (API offline)');
      form.reset();
    } finally {
      if (submitBtn) { submitBtn.textContent = 'Send Message'; submitBtn.disabled = false; }
    }
  });
});

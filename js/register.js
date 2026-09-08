// ---------- populate state select with real, live state IDs ----------
if (document.getElementById('state')) {
  populateStateSelect(document.getElementById('state'), 'Select your state');
}

// ---------- institution select, re-populated whenever state changes ----------
const stateSelectEl = document.getElementById('state');
const institutionSelectEl = document.getElementById('institution');
const institutionOtherField = document.getElementById('institutionOtherField');
const institutionOtherInput = document.getElementById('institutionOther');

if (stateSelectEl && institutionSelectEl) {
  stateSelectEl.addEventListener('change', () => {
    institutionOtherField.hidden = true;
    institutionOtherInput.required = false;
    populateInstitutionSelect(institutionSelectEl, stateSelectEl.value);
  });

  institutionSelectEl.addEventListener('change', () => {
    const isOther = institutionSelectEl.value === 'other';
    institutionOtherField.hidden = !isOther;
    institutionOtherInput.required = isOther;
    if (isOther) institutionOtherInput.focus();
  });
}

// ---------- multi-step form ----------
const regForm = document.getElementById('regForm');
if (regForm) {
  const steps = regForm.querySelectorAll('.form-step');

  function showStep(stepName) {
    steps.forEach((s) => {
      s.hidden = s.dataset.step !== String(stepName);
    });
    window.scrollTo({ top: regForm.offsetTop - 100, behavior: 'smooth' });
  }

  regForm.querySelectorAll('.step-next').forEach((btn) => {
    btn.addEventListener('click', () => {
      const current = btn.closest('.form-step');
      const required = current.querySelectorAll('[required]');
      let valid = true;
      required.forEach((field) => {
        if (!field.checkValidity()) {
          valid = false;
          field.reportValidity();
        }
      });
      if (valid) showStep(btn.dataset.goto);
    });
  });

  regForm.querySelectorAll('.step-back').forEach((btn) => {
    btn.addEventListener('click', () => showStep(btn.dataset.goto));
  });

  regForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const errorEl = document.getElementById('step3Error');
    const submitBtn = document.getElementById('submitBtn');
    errorEl.hidden = true;

    const institutionValue = institutionSelectEl.value;
    const isOtherInstitution = institutionValue === 'other';

    const payload = {
      first_name: document.getElementById('firstName').value.trim(),
      last_name: document.getElementById('lastName').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone').value.trim() || null,
      password: document.getElementById('password').value,
      state_id: parseInt(document.getElementById('state').value, 10),
      institution_id: isOtherInstitution ? null : parseInt(institutionValue, 10),
      institution_name_freetext: isOtherInstitution ? institutionOtherInput.value.trim() : null,
      level: document.getElementById('level').value,
      consent: document.getElementById('consent').checked
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Registering…';

    try {
      const result = await apiFetch('/api/auth/register', { method: 'POST', body: payload });
      // Real JWT from the backend — same cookie name the rest of the
      // portal already checks via requireAuth(), so nothing else changes.
      setCookie('srhp_session', result.token, 30);
      showStep('success');
    } catch (err) {
      errorEl.textContent = err.isNetworkError
        ? "Couldn't reach the server — the backend may not be deployed yet. Your details were not saved."
        : err.message;
      errorEl.hidden = false;
      errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Complete registration';
    }
  });
}

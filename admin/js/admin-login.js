function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

const adminLoginForm = document.getElementById('adminLoginForm');
const adminLoginError = document.getElementById('adminLoginError');

if (adminLoginForm) {
  adminLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = adminLoginForm.querySelector('button[type=submit]');
    if (adminLoginError) adminLoginError.hidden = true;

    const email = document.getElementById('adminEmail').value.trim();
    const password = document.getElementById('adminPassword').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';

    try {
      const result = await apiFetch('/api/admin/auth/login', { method: 'POST', body: { email, password } });
      // The JWT itself carries role/state_id (readable, not just enforced
      // server-side) — admin-auth.js decodes it to build the sidebar.
      setCookie('srhp_admin_session', result.token, 1);
      window.location.href = 'index.html';
    } catch (err) {
      if (adminLoginError) {
        adminLoginError.textContent = err.isNetworkError
          ? "Couldn't reach the server — the backend may not be deployed yet."
          : err.message;
        adminLoginError.hidden = false;
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
    }
  });
}

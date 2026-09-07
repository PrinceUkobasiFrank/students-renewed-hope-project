const loginForm = document.getElementById('loginForm');
const loginError = document.getElementById('loginError');

if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const submitBtn = loginForm.querySelector('button[type=submit]');
    if (loginError) loginError.hidden = true;

    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Logging in…';

    try {
      const result = await apiFetch('/api/auth/login', { method: 'POST', body: { email, password } });
      setCookie('srhp_session', result.token, 30);
      window.location.href = 'dashboard.html';
    } catch (err) {
      if (loginError) {
        loginError.textContent = err.isNetworkError
          ? "Couldn't reach the server — the backend may not be deployed yet."
          : err.message;
        loginError.hidden = false;
      }
      submitBtn.disabled = false;
      submitBtn.textContent = 'Log in';
    }
  });
}

requireAdminAuth(['super_admin']);
renderAdminChrome('admins');

const ROLE_LABELS_LOCAL = {
  super_admin: 'Super Admin',
  national_admin: 'National Admin',
  state_coordinator: 'State Coordinator',
  content_staff: 'Content Staff'
};

async function loadAdmins() {
  try {
    const admins = await apiFetch('/api/admin/admins', { authToken: getCookie('srhp_admin_session') });
    document.getElementById('adminsBody').innerHTML = admins.map((a) => `
      <tr>
        <td>${a.name}</td>
        <td>${a.email}</td>
        <td>${ROLE_LABELS_LOCAL[a.role] || a.role}</td>
        <td>${a.state || 'National'}</td>
      </tr>
    `).join('') || '<tr><td colspan="4">No admin accounts yet.</td></tr>';
  } catch (err) {
    if (err.status === 401 || err.status === 403) { logoutAdmin(); return; }
    document.getElementById('adminsBody').innerHTML = `<tr><td colspan="4">Couldn't reach the server to load admins.</td></tr>`;
  }
}
loadAdmins();

// ---------- add admin drawer ----------
const addAdminBtn = document.getElementById('addAdminBtn');
const addAdminDrawer = document.getElementById('addAdminDrawer');
const addAdminClose = document.getElementById('addAdminClose');
const addAdminForm = document.getElementById('addAdminForm');
const addAdminError = document.getElementById('addAdminError');
const newAdminRole = document.getElementById('newAdminRole');
const newAdminStateField = document.getElementById('newAdminStateField');
const newAdminState = document.getElementById('newAdminState');

if (addAdminBtn) {
  addAdminBtn.addEventListener('click', () => {
    addAdminDrawer.hidden = false;
    if (newAdminState.options.length <= 1) {
      populateStateSelect(newAdminState, 'Select a state');
    }
  });
}
if (addAdminClose) {
  addAdminClose.addEventListener('click', () => { addAdminDrawer.hidden = true; });
}
if (newAdminRole) {
  newAdminRole.addEventListener('change', () => {
    const needsState = newAdminRole.value === 'state_coordinator';
    newAdminStateField.hidden = !needsState;
    newAdminState.required = needsState;
  });
}

if (addAdminForm) {
  addAdminForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    addAdminError.hidden = true;
    const submitBtn = document.getElementById('addAdminSubmit');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating…';

    const payload = {
      name: document.getElementById('newAdminName').value.trim(),
      email: document.getElementById('newAdminEmail').value.trim(),
      password: document.getElementById('newAdminPassword').value,
      role: newAdminRole.value,
      state_id: newAdminRole.value === 'state_coordinator' ? parseInt(newAdminState.value, 10) : null
    };

    try {
      await apiFetch('/api/admin/admins', {
        method: 'POST',
        body: payload,
        authToken: getCookie('srhp_admin_session')
      });
      addAdminForm.reset();
      newAdminStateField.hidden = true;
      addAdminDrawer.hidden = true;
      loadAdmins();
    } catch (err) {
      if (err.status === 401 || err.status === 403) { logoutAdmin(); return; }
      addAdminError.textContent = err.isNetworkError
        ? "Couldn't reach the server — the backend may not be deployed yet."
        : err.message;
      addAdminError.hidden = false;
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create admin account';
    }
  });
}

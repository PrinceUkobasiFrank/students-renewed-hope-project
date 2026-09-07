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

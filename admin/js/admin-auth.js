// Real JWT admin session handling. The token itself carries role and
// state_id (set by the backend at login) — decoded here client-side purely
// for UI purposes (which sidebar links to show). This is NOT the security
// boundary: the backend independently verifies the token's signature and
// role on every /api/admin/* request, so a tampered/fake token simply gets
// 401/403'd server-side regardless of what the UI shows.

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

const ROLE_LABELS = {
  super_admin: 'Super Admin',
  national_admin: 'National Admin',
  state_coordinator: 'State Coordinator',
  content_staff: 'Content Staff'
};

function getAdminToken() {
  return getCookie('srhp_admin_session');
}

function decodeJwtPayload(token) {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map((c) =>
      '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    ).join('')));
  } catch (err) {
    return null;
  }
}

function isAdminLoggedIn() {
  const token = getAdminToken();
  return !!(token && decodeJwtPayload(token));
}
function getAdminRole() {
  const token = getAdminToken();
  const payload = token && decodeJwtPayload(token);
  return payload ? payload.role : null;
}
function getAdminStateId() {
  const token = getAdminToken();
  const payload = token && decodeJwtPayload(token);
  return payload ? payload.state_id : null;
}

// Call at the top of any admin page's JS. Optionally pass an array of
// roles allowed to view that page — anyone else gets bounced to the dashboard.
function requireAdminAuth(allowedRoles) {
  if (!isAdminLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }
  const role = getAdminRole();
  if (allowedRoles && !allowedRoles.includes(role)) {
    window.location.href = 'index.html';
  }
}

function logoutAdmin() {
  deleteCookie('srhp_admin_session');
  window.location.href = 'login.html';
}

// ---------- render the sidebar + topbar chrome, role-aware ----------
function renderAdminChrome(activePage) {
  const role = getAdminRole();
  const stateId = getAdminStateId();

  const navItems = [
    { key: 'dashboard', href: 'index.html', label: 'Overview', roles: ['super_admin', 'national_admin', 'state_coordinator', 'content_staff'] },
    { key: 'students', href: 'students.html', label: 'Students', roles: ['super_admin', 'national_admin', 'state_coordinator'] },
    { key: 'states', href: 'states.html', label: 'States', roles: ['super_admin', 'national_admin', 'state_coordinator'] },
    { key: 'cards', href: 'cards.html', label: 'Cards', roles: ['super_admin', 'national_admin'] },
    { key: 'news', href: 'news.html', label: 'News', roles: ['super_admin', 'national_admin', 'content_staff'] },
    { key: 'activity', href: 'activity.html', label: 'Activity', roles: ['super_admin', 'national_admin'] },
    { key: 'admins', href: 'admins.html', label: 'Admins', roles: ['super_admin'] }
  ];

  const sidebar = document.getElementById('adminSidebar');
  if (sidebar) {
    sidebar.innerHTML = `
      <div class="admin-brand">
        <img src="../images/shrp.jpg" alt="Students Renewed Hope Project" class="brand-logo">
        <span class="admin-brand-label">Admin</span>
      </div>
      <nav class="admin-nav">
        ${navItems.filter((item) => item.roles.includes(role)).map((item) => `
          <a href="${item.href}" class="${item.key === activePage ? 'active' : ''}">${item.label}</a>
        `).join('')}
      </nav>
    `;
  }

  const topbar = document.getElementById('adminTopbar');
  if (topbar) {
    topbar.innerHTML = `
      <div class="admin-topbar-inner">
        <span class="admin-role-badge" id="adminRoleBadge">${ROLE_LABELS[role] || 'Admin'}</span>
        <button class="btn btn-ghost" id="adminLogoutBtn">Log out</button>
      </div>
    `;
    document.getElementById('adminLogoutBtn').addEventListener('click', logoutAdmin);

    // Resolve state_id -> state name asynchronously and append to the
    // badge once known, without blocking the rest of the chrome render.
    if (role === 'state_coordinator' && stateId && typeof getLiveStates === 'function') {
      getLiveStates().then(({ data }) => {
        const state = data.find((s) => s.id === stateId);
        if (state) {
          const badge = document.getElementById('adminRoleBadge');
          if (badge) badge.textContent = `${ROLE_LABELS[role]} · ${state.name}`;
        }
      });
    }
  }
}

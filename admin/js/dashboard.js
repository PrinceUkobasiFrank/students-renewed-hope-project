requireAdminAuth();
renderAdminChrome('dashboard');

const role = getAdminRole();
const adminStateId = getAdminStateId();
const isStateCoordinator = role === 'state_coordinator';

function statCard(num, label) {
  return `<div class="admin-stat-card"><div class="num">${num}</div><div class="label">${label}</div></div>`;
}

async function loadDashboard() {
  const token = getAdminToken();
  const { data: states } = await getLiveStates();
  const stateName = isStateCoordinator ? (states.find((s) => s.id === adminStateId) || {}).name : null;

  document.getElementById('pageTitle').textContent = isStateCoordinator ? `${stateName || 'Your state'} overview` : 'National overview';
  document.getElementById('pageSub').textContent = isStateCoordinator
    ? `What's happening in ${stateName || 'your state'} right now.`
    : `Live status across all ${states.length} states.`;

  const statGrid = document.getElementById('statGrid');
  const chartBlock = document.getElementById('stateBarChart').closest('.admin-block');
  const activityBody = document.getElementById('recentActivityBody');
  const newsBody = document.getElementById('recentNewsBody');

  try {
    const dashboard = await apiFetch('/api/admin/dashboard', { authToken: token });
    const t = dashboard.totals;

    if (isStateCoordinator) {
      const stateInfo = states.find((s) => s.id === adminStateId) || {};
      statGrid.innerHTML = [
        statCard((stateInfo.students || 0).toLocaleString(), 'Registered students'),
        statCard((stateInfo.community_members || 0).toLocaleString(), 'Community members (WhatsApp)'),
        statCard(stateInfo.status === 'active' ? 'Active' : 'Pending', 'Community status'),
        statCard(t.total_cards, 'Cards generated'),
        statCard(dashboard.recent_activity.length, 'Recent activity events')
      ].join('');
    } else {
      statGrid.innerHTML = [
        statCard(parseInt(t.total_students, 10).toLocaleString(), 'Registered students'),
        statCard(`${t.active_states}/${t.total_states}`, 'States activated'),
        statCard(parseInt(t.total_cards, 10).toLocaleString(), 'Cards generated'),
        statCard(parseInt(t.community_members, 10).toLocaleString(), 'Community members (WhatsApp)'),
        statCard(t.total_states - t.active_states, 'States pending a coordinator')
      ].join('');
    }

    chartBlock.querySelector('.section-head h2').textContent = isStateCoordinator ? 'Platform status' : 'Platform status';
    const activeStates = states.filter((s) => s.status === 'active');
    chartBlock.querySelector('.admin-bar-chart-wrap, .admin-table-wrap')?.remove();
    const statusTable = document.createElement('div');
    statusTable.className = 'admin-table-wrap';
    statusTable.innerHTML = `
      <table class="admin-table"><tbody>
        ${activeStates.map((s) => `
          <tr>
            <td>${s.name}</td>
            <td><span class="admin-badge admin-badge-active">Active</span></td>
            <td style="text-align:right;">${(s.community_members || 0).toLocaleString()} community members</td>
          </tr>
        `).join('')}
        <tr><td colspan="3" style="color:#8A9080;">Remaining ${states.length - activeStates.length} states have no coordinator assigned yet.</td></tr>
      </tbody></table>
    `;
    chartBlock.appendChild(statusTable);

    const dateTimeFmt = (iso) => new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    activityBody.innerHTML = dashboard.recent_activity.map((a) => `
      <tr><td>${a.event_type}${a.first_name ? ` — ${a.first_name} ${a.last_name}` : ''}</td>
      <td style="text-align:right;color:#8A9080;white-space:nowrap;">${dateTimeFmt(a.created_at)}</td></tr>
    `).join('') || '<tr><td>No activity yet.</td></tr>';

    const dateFmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    newsBody.innerHTML = dashboard.recent_news.map((n) => `
      <tr><td>${n.title}</td><td style="text-transform:capitalize;">${n.category}</td><td>${dateFmt(n.published_at)}</td></tr>
    `).join('');

  } catch (err) {
    // Backend unreachable or token invalid — say so plainly, don't fake data.
    if (err.status === 401 || err.status === 403) { logoutAdmin(); return; }
    statGrid.innerHTML = '';
    showOfflineNotice(document.querySelector('.admin-content'));
    document.getElementById('pageSub').textContent = "Couldn't reach the server to load live stats.";
  }
}

function getAdminToken() {
  return getCookie('srhp_admin_session');
}

loadDashboard();

requireAdminAuth(['super_admin', 'national_admin', 'state_coordinator']);
renderAdminChrome('states');

const role = getAdminRole();
const adminStateId = getAdminStateId();
const isStateCoordinator = role === 'state_coordinator';

const stateSearch = document.getElementById('stateSearch');
const statusFilter = document.getElementById('statusFilter');
const statesBody = document.getElementById('statesBody');
let allStates = [];

async function init() {
  const { data } = await getLiveStates();
  allStates = isStateCoordinator ? data.filter((s) => s.id === adminStateId) : data;

  document.getElementById('pageSub').textContent = isStateCoordinator
    ? `Managing ${(allStates[0] || {}).name || 'your state'}.`
    : `${data.length} states, ${data.filter((s) => s.status === 'active').length} with an active community.`;

  if (isStateCoordinator) document.getElementById('statesToolbar').hidden = true;

  renderStates();
  if (isStateCoordinator && allStates[0]) openDrawer(allStates[0].name);
}

function renderStates() {
  const q = (stateSearch ? stateSearch.value : '').trim().toLowerCase();
  const statusVal = statusFilter ? statusFilter.value : '';
  const filtered = allStates.filter((s) => {
    const matchesQ = s.name.toLowerCase().includes(q);
    const matchesStatus = !statusVal || s.status === statusVal;
    return matchesQ && matchesStatus;
  });

  statesBody.innerHTML = filtered.map((s) => `
    <tr data-name="${s.name}">
      <td>${s.name}</td>
      <td>${s.students.toLocaleString()}</td>
      <td>${s.status === 'active' ? '<span class="admin-badge admin-badge-active">Active</span>' : '<span class="admin-badge admin-badge-pending">Pending</span>'}</td>
      <td>${s.community_members ? s.community_members.toLocaleString() + '+ (WhatsApp)' : '—'}</td>
    </tr>
  `).join('');

  statesBody.querySelectorAll('tr[data-name]').forEach((row) => {
    row.addEventListener('click', () => openDrawer(row.dataset.name));
  });
}

if (stateSearch) stateSearch.addEventListener('input', renderStates);
if (statusFilter) statusFilter.addEventListener('input', renderStates);

const drawer = document.getElementById('stateDrawer');
const drawerContent = document.getElementById('drawerContent');
document.getElementById('drawerClose').addEventListener('click', () => { drawer.hidden = true; });
drawer.addEventListener('click', (e) => { if (e.target === drawer) drawer.hidden = true; });

function openDrawer(stateName) {
  const s = allStates.find((st) => st.name === stateName);
  if (!s) return;

  drawerContent.innerHTML = `
    <p class="hero-kicker">State detail</p>
    <h2>${s.name}</h2>
    <dl>
      <dt>Registered students</dt><dd>${s.students.toLocaleString()}</dd>
      <dt>Community status</dt><dd>${s.status === 'active' ? 'Active' : 'Coordinator pending'}</dd>
      ${s.community_members ? `<dt>WhatsApp community members</dt><dd>${s.community_members.toLocaleString()}+</dd>` : ''}
      ${s.community_links ? `<dt>Community groups</dt><dd>${s.community_links.map((l) => `${l.label} (${l.note})`).join(', ')}</dd>` : ''}
    </dl>
  `;
  drawer.hidden = false;
}

init();

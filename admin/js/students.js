requireAdminAuth(['super_admin', 'national_admin', 'state_coordinator']);
renderAdminChrome('students');

const role = getAdminRole();
const adminStateId = getAdminStateId();
const isStateCoordinator = role === 'state_coordinator';

const stateFilter = document.getElementById('stateFilter');
const levelFilter = document.getElementById('levelFilter');
const studentSearch = document.getElementById('studentSearch');
const studentsBody = document.getElementById('studentsBody');
const paginationInfo = document.getElementById('paginationInfo');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');

const PAGE_SIZE = 20;
let currentPage = 1;
let allStatesData = [];

function getAdminToken() { return getCookie('srhp_admin_session'); }
function dateFmt(iso) { return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }

async function init() {
  const { data } = await getLiveStates();
  allStatesData = data;

  if (isStateCoordinator) {
    stateFilter.hidden = true;
  } else {
    data.forEach((s) => {
      const opt = document.createElement('option');
      opt.value = s.name;
      opt.textContent = s.name;
      stateFilter.appendChild(opt);
    });
  }

  await renderTable();
}

async function renderTable() {
  const params = new URLSearchParams({ page: currentPage, pageSize: PAGE_SIZE });
  if (studentSearch.value.trim()) params.set('search', studentSearch.value.trim());
  if (!isStateCoordinator && stateFilter.value) params.set('state', stateFilter.value);
  if (levelFilter.value) params.set('level', levelFilter.value);

  try {
    const result = await apiFetch(`/api/admin/students?${params}`, { authToken: getAdminToken() });

    document.getElementById('pageSub').textContent = isStateCoordinator
      ? `${result.total.toLocaleString()} registered students in your state.`
      : `${result.total.toLocaleString()} registered students across ${allStatesData.length} states.`;

    studentsBody.innerHTML = result.students.map((s) => `
      <tr data-id="${s.id}">
        <td>${s.first_name} ${s.last_name}</td>
        <td>${s.state}</td>
        <td>${s.institution || '—'}</td>
        <td>${s.level || '—'}</td>
        <td>${dateFmt(s.created_at)}</td>
        <td>—</td>
        <td>—</td>
      </tr>
    `).join('') || `<tr><td colspan="7">${result.total === 0 ? "No students have registered yet." : 'No students match this search.'}</td></tr>`;

    const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));
    paginationInfo.textContent = `Showing ${result.students.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}–${(currentPage - 1) * PAGE_SIZE + result.students.length} of ${result.total}`;
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= totalPages;

  } catch (err) {
    if (err.status === 401 || err.status === 403) { logoutAdmin(); return; }
    studentsBody.innerHTML = `<tr><td colspan="7">Couldn't reach the server to load students.</td></tr>`;
    paginationInfo.textContent = '';
  }
}

[studentSearch, stateFilter, levelFilter].forEach((el) => {
  el.addEventListener('input', () => { currentPage = 1; renderTable(); });
});
prevPageBtn.addEventListener('click', () => { currentPage--; renderTable(); });
nextPageBtn.addEventListener('click', () => { currentPage++; renderTable(); });

init();

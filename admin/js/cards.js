requireAdminAuth(['super_admin', 'national_admin']);
renderAdminChrome('cards');

function getAdminToken() { return getCookie('srhp_admin_session'); }
function statCard(num, label) {
  return `<div class="admin-stat-card"><div class="num">${num}</div><div class="label">${label}</div></div>`;
}

async function loadCards() {
  const token = getAdminToken();
  const chartBlock = document.getElementById('cardBarChart').closest('.admin-block');

  try {
    const [cardStats, { data: states }] = await Promise.all([
      apiFetch('/api/admin/cards/stats', { authToken: token }),
      getLiveStates()
    ]);

    const total = parseInt(cardStats.total_cards, 10);
    const shares = parseInt(cardStats.total_shares, 10);
    const totalStudents = states.reduce((sum, s) => sum + s.students, 0);
    const avg = totalStudents ? (total / totalStudents).toFixed(2) : '—';
    const activeStates = states.filter((s) => s.status === 'active').length;

    document.getElementById('cardStatGrid').innerHTML = [
      statCard(total.toLocaleString(), 'Cards generated (all time)'),
      statCard(shares.toLocaleString(), 'Times shared'),
      statCard(avg, 'Avg. cards per student'),
      statCard(activeStates, 'States with an active community'),
      statCard(states.length, 'Total states')
    ].join('');

    chartBlock.querySelector('.section-head h2').textContent = 'Card generation status';
    chartBlock.querySelector('.admin-bar-chart-wrap').outerHTML = total > 0
      ? `<div class="admin-table-wrap"><table class="admin-table"><tbody>
           <tr><td>Total cards generated</td><td style="text-align:right;">${total.toLocaleString()}</td></tr>
           <tr><td>Total times shared</td><td style="text-align:right;">${shares.toLocaleString()}</td></tr>
         </tbody></table></div>`
      : `<div class="admin-table-wrap"><table class="admin-table"><tbody>
           <tr><td>No supporter cards have been generated yet.</td></tr>
         </tbody></table></div>`;

    document.getElementById('cardActivityBody').innerHTML = '<tr><td>Per-event card activity isn\'t broken out separately yet — see Activity for the full log.</td></tr>';

  } catch (err) {
    if (err.status === 401 || err.status === 403) { logoutAdmin(); return; }
    document.getElementById('cardStatGrid').innerHTML = '';
    showOfflineNotice(document.querySelector('.admin-content'));
  }
}
loadCards();

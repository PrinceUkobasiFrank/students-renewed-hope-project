requireAuth();

const dashCanvas = document.getElementById('dashCardCanvas');

function drawMiniCard(s) {
  if (!dashCanvas) return;
  const ctx = dashCanvas.getContext('2d');
  const w = dashCanvas.width, h = dashCanvas.height;
  const draw = () => {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#EFB958');
    grad.addColorStop(1, '#C88A24');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(0, 0, w, h, 28) : ctx.rect(0, 0, w, h);
    ctx.fill();

    const pad = 56;
    ctx.fillStyle = '#123524';
    ctx.font = '700 26px Inter, sans-serif';
    ctx.textBaseline = 'top';
    ctx.fillText("SUPPORTER'S CARD", pad, pad);

    ctx.font = '800 66px "Big Shoulders Display", sans-serif';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(`${s.first_name} ${s.last_name}`, pad, h - pad - 78, w - pad * 2);

    ctx.font = '600 32px Inter, sans-serif';
    ctx.fillText(s.state || '', pad, h - pad - 30);
  };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw); else draw();
}

async function loadDashboard() {
  const token = getSessionToken();
  try {
    const student = await apiFetch('/api/students/me', { authToken: token });

    document.getElementById('dashGreeting').textContent = `Welcome back, ${student.first_name}`;
    document.getElementById('dashSub').textContent = `${student.institution_name_freetext || 'Institution not set'} · ${student.level || ''} · ${student.state}`;
    document.getElementById('dashProfileName').textContent = `${student.first_name} ${student.last_name}`;
    document.getElementById('dashProfileMeta').textContent = student.email;
    document.getElementById('dashCardCount').textContent =
      `${student.cards_generated} card${student.cards_generated === 1 ? '' : 's'} generated so far.`;
    document.getElementById('dashCommunityStatus').textContent =
      `Connected to the ${student.state} community.`;

    drawMiniCard(student);

    const activityList = document.getElementById('activityList');
    const dateFmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    const activityLabels = {
      student_registered: 'Registered',
      card_generated: 'Generated a supporter card',
      card_shared: 'Shared a supporter card',
      community_clicked: 'Joined the community',
      news_viewed: 'Read a news update'
    };
    activityList.innerHTML = (student.activity || []).map((a) => `
      <li class="activity-row">
        <span class="activity-label">${activityLabels[a.type] || a.type}</span>
        <span class="activity-date">${dateFmt(a.created_at)}</span>
      </li>
    `).join('') || '<li class="activity-row"><span class="activity-label">No activity yet.</span></li>';

  } catch (err) {
    if (err.status === 401) {
      // Expired/invalid token — send back to login rather than show stale data.
      logout();
      return;
    }
    // Backend unreachable — say so plainly rather than showing fake data.
    document.getElementById('dashGreeting').textContent = 'Welcome back';
    document.getElementById('dashSub').textContent = "Couldn't reach the server to load your dashboard.";
    showOfflineNotice(document.querySelector('.dash-section .wrap'));
  }
}
loadDashboard();

// ---------- news preview (still fine to show even if profile fetch failed) ----------
(async function initDashNews() {
  const dashNewsGrid = document.getElementById('dashNewsGrid');
  if (!dashNewsGrid) return;
  const { data } = await getLiveNews();
  const dateFmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const sorted = [...data].sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  dashNewsGrid.innerHTML = sorted.slice(0, 3).map((item) => `
    <article class="news-card" data-category="${item.category}">
      <span class="news-cat">${item.category}</span>
      <h3>${item.title}</h3>
      <p>${item.excerpt}</p>
      <span class="news-date">${dateFmt(item.published_at)}</span>
    </article>
  `).join('');
})();

// ---------- logout ----------
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', logout);

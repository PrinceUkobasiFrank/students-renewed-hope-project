const statesList = document.getElementById('statesList');
const statesCount = document.getElementById('statesCount');
const statesEmpty = document.getElementById('statesEmpty');
const stateSearch = document.getElementById('stateSearch');
const filterChips = document.querySelectorAll('.filter-chip');

let activeFilter = 'all';

function renderStates() {
  const query = (stateSearch.value || '').trim().toLowerCase();

  const filtered = MOCK_STATES.filter((s) => {
    const matchesQuery = s.name.toLowerCase().includes(query);
    const matchesFilter = activeFilter === 'all' || s.status === activeFilter;
    return matchesQuery && matchesFilter;
  });

  statesCount.textContent = `Showing ${filtered.length} of ${MOCK_STATES.length} states`;
  statesEmpty.hidden = filtered.length !== 0;

  statesList.innerHTML = filtered.map((s) => {
    const meta = s.status === 'active' && s.community_members
      ? `${s.community_members.toLocaleString()}+ community members`
      : `${s.students.toLocaleString()} registered students`;

    const action = s.status === 'active'
      ? `<span class="state-status state-status-active">Community active</span>
         <button class="btn btn-primary join-toggle" data-code="${s.code.toLowerCase()}">Join community</button>`
      : `<span class="state-status state-status-pending">Coordinator pending</span>
         <a href="register.html" class="btn btn-ghost">Register anyway</a>`;

    const chooser = s.community_links ? `
      <div class="join-chooser" id="chooser-${s.code.toLowerCase()}" hidden>
        <p class="join-chooser-note">Akwa Ibom has two active WhatsApp groups — join whichever has room.</p>
        ${s.community_links.map((link) => `
          <a href="${link.url}" target="_blank" rel="noopener" class="join-chooser-option">
            <span>${link.label}</span>
            <span class="join-chooser-tag">${link.note}</span>
          </a>
        `).join('')}
      </div>
    ` : '';

    return `
      <article class="state-row" id="${s.code.toLowerCase()}">
        <div class="state-row-main">
          <span class="state-code">${s.code}</span>
          <div>
            <h3>${s.name}</h3>
            <p class="state-meta">${meta}</p>
          </div>
        </div>
        <div class="state-row-action">${action}</div>
        ${chooser}
      </article>
    `;
  }).join('');

  statesList.querySelectorAll('.join-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const panel = document.getElementById(`chooser-${btn.dataset.code}`);
      if (panel) panel.hidden = !panel.hidden;
    });
  });
}

if (statesList) {
  stateSearch.addEventListener('input', renderStates);
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter;
      renderStates();
    });
  });

  // Jump to a state if arriving via #code from another page
  if (window.location.hash) {
    stateSearch.value = '';
  }

  renderStates();
}

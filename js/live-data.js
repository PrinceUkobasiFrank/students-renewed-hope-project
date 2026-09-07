// Wraps every "give me real platform data" call with the same pattern:
// try the live API first; if it's unreachable (backend not deployed yet,
// wrong URL, offline), fall back to the static MOCK_* data so the site
// still renders — but flag isLive: false so callers can show that honestly
// instead of silently presenting stale/fake numbers as if they were real.

let _statesCache = null;
async function getLiveStates() {
  if (_statesCache) return _statesCache;
  try {
    const states = await apiFetch('/api/states');
    _statesCache = { data: states, isLive: true };
  } catch (err) {
    console.warn('Live states unavailable, falling back to static data:', err.message);
    _statesCache = { data: MOCK_STATES, isLive: false };
  }
  return _statesCache;
}

let _statsCache = null;
async function getLiveStats() {
  if (_statsCache) return _statsCache;
  try {
    const stats = await apiFetch('/api/stats');
    _statsCache = { data: stats, isLive: true };
  } catch (err) {
    console.warn('Live stats unavailable, falling back to static data:', err.message);
    _statsCache = {
      data: {
        total_students: MOCK_TOTAL_STUDENTS,
        active_states: MOCK_ACTIVE_STATES,
        total_states: MOCK_STATES.length,
        total_cards: MOCK_CARDS_TOTAL,
        community_members: MOCK_COMMUNITY_MEMBERS_TOTAL
      },
      isLive: false
    };
  }
  return _statsCache;
}

let _newsCache = null;
async function getLiveNews() {
  if (_newsCache) return _newsCache;
  try {
    const news = await apiFetch('/api/news');
    _newsCache = { data: news, isLive: true };
  } catch (err) {
    console.warn('Live news unavailable, falling back to static data:', err.message);
    _newsCache = { data: MOCK_NEWS, isLive: false };
  }
  return _newsCache;
}

function showOfflineNotice(containerEl) {
  if (!containerEl || document.getElementById('offlineNotice')) return;
  const notice = document.createElement('div');
  notice.id = 'offlineNotice';
  notice.className = 'offline-notice';
  notice.textContent = "Showing example data — couldn't reach the live server.";
  containerEl.prepend(notice);
}

// Shared helper: fills a <select> with real states (value = real numeric
// state id) so every form that submits a state_id to the backend sends a
// real one, not a locally-guessed number. Used by register/card/contact/profile.
async function populateStateSelect(selectEl, placeholder, placeholderSelectable) {
  if (!selectEl) return;
  const { data } = await getLiveStates();
  const current = selectEl.value;
  const disabledAttr = placeholderSelectable ? '' : 'disabled';
  const placeholderHtml = placeholder
    ? `<option value="" ${disabledAttr} ${!current ? 'selected' : ''}>${placeholder}</option>`
    : '';
  selectEl.innerHTML = placeholderHtml + data.map((s) => `<option value="${s.id}">${s.name}</option>`).join('');
  if (current) selectEl.value = current;
}

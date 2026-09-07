// ---------- mobile nav ----------
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('mainNav');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    mainNav.classList.toggle('open');
  });
}

// ---------- notifications panel (cookie-flagged "seen" state) ----------
const notifBtn = document.getElementById('notifBtn');
const notifPanel = document.getElementById('notifPanel');
const notifDot = document.getElementById('notifDot');

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}

// Show the notification dot unless this browser has already seen it
if (notifDot && !getCookie('srhp_notif_seen')) {
  notifDot.hidden = false;
}
if (notifBtn) {
  notifBtn.addEventListener('click', () => {
    notifPanel.hidden = !notifPanel.hidden;
    if (notifDot) {
      notifDot.hidden = true;
      setCookie('srhp_notif_seen', '1', 30);
    }
  });
}

// ---------- wire hero stats to live data (falls back to static if API unreachable) ----------
(async function initHeroStats() {
  const totalEl = document.getElementById('statTotalStudents');
  if (!totalEl || typeof getLiveStats !== 'function') return;

  const { data, isLive } = await getLiveStats();
  totalEl.dataset.count = data.total_students;
  document.getElementById('statStatesActivated').dataset.count = data.active_states;
  document.getElementById('statCardsGenerated').dataset.count = data.total_cards;

  if (!isLive) {
    const heroStats = totalEl.closest('.hero-stats');
    if (heroStats) showOfflineNotice(heroStats);
  }

  // Stats may already be in view by the time this resolves — animate now
  // instead of waiting on the IntersectionObserver below for these three.
  [totalEl, document.getElementById('statStatesActivated'), document.getElementById('statCardsGenerated')]
    .forEach((el) => { if (isElementInViewport(el)) animateCount(el); });
})();

function isElementInViewport(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  return rect.top < window.innerHeight && rect.bottom > 0;
}

// ---------- stat count-up ----------
function animateCount(el) {
  if (el.dataset.animated) return;
  el.dataset.animated = '1';
  const target = parseInt(el.dataset.count, 10);
  if (!target) {
    el.textContent = '0';
    return;
  }
  const duration = 1200;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
const statEls = document.querySelectorAll('.stat-num');
if (statEls.length) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && entry.target.dataset.count) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  statEls.forEach((el) => observer.observe(el));
}

// ---------- render latest news (homepage) ----------
(async function initHomeNews() {
  const newsGrid = document.getElementById('newsGrid');
  if (!newsGrid || typeof getLiveNews !== 'function') return;

  const { data, isLive } = await getLiveNews();
  const dateFmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  const sorted = [...data].sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  newsGrid.innerHTML = sorted.slice(0, 3).map((item) => `
    <article class="news-card" data-category="${item.category}">
      <span class="news-cat">${item.category}</span>
      <h3>${item.title}</h3>
      <p>${item.excerpt}</p>
      <span class="news-date">${dateFmt(item.published_at)}</span>
    </article>
  `).join('');
  if (!isLive) showOfflineNotice(newsGrid.closest('.news-section').querySelector('.wrap'));
})();

// ---------- render state chips (homepage) ----------
(async function initStateChips() {
  const stateChips = document.getElementById('stateChips');
  if (!stateChips || typeof getLiveStates !== 'function') return;

  const { data } = await getLiveStates();
  stateChips.innerHTML = data.slice(0, 8).map((s) => `
    <a class="state-chip" href="states.html#${s.code.toLowerCase()}">${s.name}</a>
  `).join('');
})();

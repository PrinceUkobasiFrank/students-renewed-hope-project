const newsFeature = document.getElementById('newsFeature');
const newsGridFull = document.getElementById('newsGridFull');
const newsEmpty = document.getElementById('newsEmpty');
const newsFilterChips = document.querySelectorAll('.news-filter-row .filter-chip');

const dateFmt = (iso) => new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

let activeCategory = 'all';

function renderNews() {
  const sorted = [...MOCK_NEWS].sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
  const filtered = activeCategory === 'all' ? sorted : sorted.filter((n) => n.category === activeCategory);

  if (!filtered.length) {
    newsFeature.hidden = true;
    newsGridFull.hidden = true;
    newsEmpty.hidden = false;
    return;
  }
  newsEmpty.hidden = true;
  newsFeature.hidden = false;
  newsGridFull.hidden = false;

  const [featured, ...rest] = filtered;

  newsFeature.dataset.category = featured.category;
  newsFeature.innerHTML = `
    <span class="news-cat">${featured.category}</span>
    <h2>${featured.title}</h2>
    <p>${featured.body}</p>
    <span class="news-date">${dateFmt(featured.published_at)}</span>
  `;

  newsGridFull.innerHTML = rest.map((item) => `
    <article class="news-card" data-category="${item.category}">
      <span class="news-cat">${item.category}</span>
      <h3>${item.title}</h3>
      <p>${item.excerpt}</p>
      <span class="news-date">${dateFmt(item.published_at)}</span>
    </article>
  `).join('') + (rest.length % 2 === 1 ? `
    <article class="news-card news-card-filler">
      <p>More updates coming soon.</p>
    </article>
  ` : '');
}

if (newsFeature) {
  newsFilterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      newsFilterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.dataset.filter;
      renderNews();
    });
  });
  renderNews();
}

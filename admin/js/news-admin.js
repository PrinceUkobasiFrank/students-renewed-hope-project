requireAdminAuth(['super_admin', 'national_admin', 'content_staff']);
renderAdminChrome('news');

function getAdminToken() { return getCookie('srhp_admin_session'); }
function dateFmt(iso) { return iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'; }

const tbody = document.getElementById('newsBody_');
const form = document.getElementById('newsForm');
const formTitle = document.getElementById('newsFormTitle');
const newPostBtn = document.getElementById('newPostBtn');
const cancelBtn = document.getElementById('cancelNewsForm');
const formError = document.getElementById('newsFormError');

let newsItems = [];

async function loadNews() {
  try {
    newsItems = await apiFetch('/api/admin/news', { authToken: getAdminToken() });
    renderList();
  } catch (err) {
    if (err.status === 401 || err.status === 403) { logoutAdmin(); return; }
    tbody.innerHTML = `<tr><td colspan="5">Couldn't reach the server to load news.</td></tr>`;
  }
}

function renderList() {
  const sorted = [...newsItems].sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
  tbody.innerHTML = sorted.map((n) => `
    <tr>
      <td>${n.title}</td>
      <td style="text-transform:capitalize;">${n.category}</td>
      <td>${n.status === 'published' ? '<span class="admin-badge admin-badge-active">Published</span>' : '<span class="admin-badge admin-badge-draft">Draft</span>'}</td>
      <td>${dateFmt(n.published_at)}</td>
      <td style="text-align:right;white-space:nowrap;">
        <button class="text-link" data-edit="${n.id}" style="background:none;border:none;cursor:pointer;">Edit</button>
        &nbsp;·&nbsp;
        <button class="text-link" data-delete="${n.id}" style="background:none;border:none;cursor:pointer;color:#B5432E;">Delete</button>
      </td>
    </tr>
  `).join('') || '<tr><td colspan="5">No news items yet.</td></tr>';

  tbody.querySelectorAll('[data-edit]').forEach((btn) => {
    btn.addEventListener('click', () => openForm(parseInt(btn.dataset.edit, 10)));
  });
  tbody.querySelectorAll('[data-delete]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      if (!confirm('Delete this news item? This cannot be undone.')) return;
      try {
        await apiFetch(`/api/admin/news/${btn.dataset.delete}`, { method: 'DELETE', authToken: getAdminToken() });
        newsItems = newsItems.filter((n) => n.id !== parseInt(btn.dataset.delete, 10));
        renderList();
      } catch (err) {
        alert(err.isNetworkError ? "Couldn't reach the server — nothing was deleted." : err.message);
      }
    });
  });
}

function openForm(id) {
  form.hidden = false;
  if (formError) formError.hidden = true;
  if (id) {
    const n = newsItems.find((item) => item.id === id);
    formTitle.textContent = 'Edit update';
    document.getElementById('newsEditId').value = n.id;
    document.getElementById('newsTitle').value = n.title;
    document.getElementById('newsCategory').value = n.category;
    document.getElementById('newsStatus').value = n.status;
    document.getElementById('newsExcerpt').value = n.excerpt;
    document.getElementById('newsBody').value = n.body || '';
  } else {
    formTitle.textContent = 'New update';
    form.reset();
    document.getElementById('newsEditId').value = '';
  }
  form.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

newPostBtn.addEventListener('click', () => openForm(null));
cancelBtn.addEventListener('click', () => { form.hidden = true; });

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (formError) formError.hidden = true;
  const id = document.getElementById('newsEditId').value;
  const payload = {
    title: document.getElementById('newsTitle').value.trim(),
    category: document.getElementById('newsCategory').value,
    status: document.getElementById('newsStatus').value,
    excerpt: document.getElementById('newsExcerpt').value.trim(),
    body: document.getElementById('newsBody').value.trim()
  };

  try {
    if (id) {
      const updated = await apiFetch(`/api/admin/news/${id}`, { method: 'PATCH', body: payload, authToken: getAdminToken() });
      const idx = newsItems.findIndex((n) => n.id === parseInt(id, 10));
      newsItems[idx] = updated;
    } else {
      const created = await apiFetch('/api/admin/news', { method: 'POST', body: payload, authToken: getAdminToken() });
      newsItems.push(created);
    }
    form.hidden = true;
    renderList();
  } catch (err) {
    if (formError) {
      formError.textContent = err.isNetworkError
        ? "Couldn't reach the server — this update was not saved."
        : err.message;
      formError.hidden = false;
    }
  }
});

loadNews();

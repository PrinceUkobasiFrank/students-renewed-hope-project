// Single place to point the frontend at your backend once it's deployed.
// Everything else in this file, and in live-data.js, reads this constant —
// change it here and every page picks it up.
const API_BASE_URL = 'https://students-renewed-hope-project-backend-production-379a.up.railway.app'; // TODO: replace with your deployed Railway backend URL

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (options.authToken) headers['Authorization'] = `Bearer ${options.authToken}`;

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined
    });
  } catch (networkErr) {
    // Backend unreachable (not deployed yet, wrong URL, offline, etc.)
    const err = new Error('Could not reach the server. Is the backend deployed and API_BASE_URL correct?');
    err.isNetworkError = true;
    throw err;
  }

  let data = null;
  try { data = await res.json(); } catch (e) { /* empty body, e.g. 204 */ }

  if (!res.ok) {
    const err = new Error((data && data.error) || `Request failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return data;
}

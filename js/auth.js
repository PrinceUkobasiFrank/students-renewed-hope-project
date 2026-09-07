// Real JWT session handling. A logged-in student has a JWT (not the literal
// string "mock-session" from earlier demo builds) stored in this cookie.

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}
function setCookie(name, value, days) {
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/`;
}
function deleteCookie(name) {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
}

function getSessionToken() {
  return getCookie('srhp_session');
}
function isLoggedIn() {
  return !!getSessionToken();
}

// Call at the top of any portal page. Redirects to login if not authenticated.
function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
  }
}

function logout() {
  deleteCookie('srhp_session');
  window.location.href = 'login.html';
}

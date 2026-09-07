requireAuth();

const pfState = document.getElementById('pfState');
if (pfState) populateStateSelect(pfState, null);

const profileForm = document.getElementById('profileForm');
const profileNote = document.getElementById('profileNote');
const profileError = document.getElementById('profileError');

async function loadProfile() {
  const token = getSessionToken();
  try {
    const student = await apiFetch('/api/students/me', { authToken: token });
    document.getElementById('pfFirstName').value = student.first_name;
    document.getElementById('pfLastName').value = student.last_name;
    document.getElementById('pfEmail').value = student.email;
    document.getElementById('pfPhone').value = student.phone || '';
    document.getElementById('pfInstitution').value = student.institution_name_freetext || '';
    document.getElementById('pfLevel').value = student.level || '';
    if (pfState) {
      await populateStateSelect(pfState, null);
      pfState.value = student.state_id;
    }
  } catch (err) {
    if (err.status === 401) { logout(); return; }
    if (profileError) {
      profileError.textContent = "Couldn't load your profile — the server may be unreachable.";
      profileError.hidden = false;
    }
  }
}
loadProfile();

if (profileForm) {
  profileForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (profileError) profileError.hidden = true;
    if (profileNote) profileNote.hidden = true;

    const payload = {
      first_name: document.getElementById('pfFirstName').value.trim(),
      last_name: document.getElementById('pfLastName').value.trim(),
      phone: document.getElementById('pfPhone').value.trim() || null,
      state_id: parseInt(pfState.value, 10),
      level: document.getElementById('pfLevel').value,
      institution_name_freetext: document.getElementById('pfInstitution').value.trim()
    };

    try {
      await apiFetch('/api/students/me', { method: 'PATCH', body: payload, authToken: getSessionToken() });
      if (profileNote) profileNote.hidden = false;
    } catch (err) {
      if (err.status === 401) { logout(); return; }
      if (profileError) {
        profileError.textContent = err.isNetworkError
          ? "Couldn't reach the server — changes were not saved."
          : err.message;
        profileError.hidden = false;
      }
    }
  });
}

const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) logoutBtn.addEventListener('click', logout);

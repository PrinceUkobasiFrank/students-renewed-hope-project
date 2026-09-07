const CONTACT_EMAIL = 'hello@studentsrenewedhope.com.ng';

const ctState = document.getElementById('ctState');
if (ctState) populateStateSelect(ctState, 'Not state-specific', true);

const contactForm = document.getElementById('contactForm');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const reason = document.getElementById('ctReason').value;
    const name = document.getElementById('ctName').value.trim();
    const email = document.getElementById('ctEmail').value.trim();
    const stateId = ctState.value ? parseInt(ctState.value, 10) : null;
    const stateName = ctState.value ? ctState.options[ctState.selectedIndex].text : null;
    const message = document.getElementById('ctMessage').value.trim();

    // Best-effort: also land this in the CRM if the backend's reachable.
    // Never blocks the mailto fallback below, which always works.
    try {
      await apiFetch('/api/contact', {
        method: 'POST',
        body: { reason, name, email, state_id: stateId, message }
      });
    } catch (err) {
      console.warn('Could not save this message to the CRM (mailto will still open):', err.message);
    }

    const subject = `[SRHP contact] ${reason || 'General question'}`;
    const bodyLines = [
      `Name: ${name}`,
      `Email: ${email}`,
      stateName ? `State: ${stateName}` : null,
      '',
      message
    ].filter((line) => line !== null);

    const mailtoUrl = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;
    window.location.href = mailtoUrl;
  });
}

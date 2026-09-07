// Admin-side data layer, built on top of the shared public mock-data.js
// (MOCK_STATES, MOCK_INSTITUTIONS, MOCK_NEWS).
//
// IMPORTANT: the platform hasn't launched yet, so there are genuinely no
// registered students and no activity to show. ADMIN_STUDENTS and
// ADMIN_ACTIVITY are intentionally empty arrays, not fabricated sample
// data — every page here is built to render a correct empty state instead.
// Once the backend is live, these two lines are replaced by
// GET /api/students and GET /api/activity; nothing else needs to change,
// since every page already consumes them as plain arrays.

const ADMIN_STUDENTS = [];
const ADMIN_ACTIVITY = [];

// ---------- admins ----------
// Placeholder/demo accounts only, used to exercise the role-based login and
// sidebar — not a claim that these people have real CRM accounts yet.
const ADMIN_USERS = [
  { id: 1, name: "You", email: "you@srhp.example", role: "super_admin", state: null }
];

// ---------- helpers ----------
function studentsForState(stateName) {
  return ADMIN_STUDENTS.filter((s) => s.state === stateName);
}
function activityForState(stateName) {
  return ADMIN_ACTIVITY.filter((a) => a.state === stateName);
}
function dateFmt(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function dateTimeFmt(iso) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

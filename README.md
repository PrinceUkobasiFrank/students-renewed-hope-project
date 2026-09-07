# Students Renewed Hope Project — Full Frontend (Public + Portal + Admin CRM)

## This pass: social sharing + Railway-ready comments

### Social sharing (card.html)
Generating a card now shows a "Or invite others to make their own" row
with four platform buttons (`images/icons/*.svg`) below the existing
Download/Share-image buttons:
- **Facebook, X, WhatsApp** — open that platform's real share dialog with
  a smart, rotating caption (6 variants, not generic "check this out")
  plus a link back to the card generator. Verified the URLs are built
  correctly — X gets caption and link as separate params (no duplicate
  link), WhatsApp gets them combined, Facebook gets both `u` and `quote`.
- **Instagram** — Instagram has no web share-intent at all (a real platform
  limitation, not something fixable client-side). Clicking it copies the
  caption to your clipboard, downloads the card image, and opens
  instagram.com, with an on-screen note to paste the caption when posting.

**Worth knowing:** there's no way to target WhatsApp Business separately
from regular WhatsApp via a web link — both register the same `wa.me`
handler, and the OS picks whichever's installed. One WhatsApp button
covers both rather than faking two buttons that'd do the identical thing.

Captions live in `js/card.js`'s `CAPTIONS` array — six rotating options,
easy to add more or edit the tone.

### One line to go live, updated
`js/api-config.js`'s `API_BASE_URL` comment now says "Railway URL" instead
of "Cloud Run URL" — same one line to change, just pointed at wherever you
actually deploy the backend (see `backend.zip`'s README for Railway steps,
including the new welcome-email setup).

## Previous pass: wired to the real backend
Every form that matters talks to the backend instead of updating a static
mock array. **This is code-complete, not live** — until you deploy the
backend and set the real URL in `js/api-config.js`, every page will show
an honest "couldn't reach the server" state and fall back to static
example data. That fallback is intentional: the site never breaks, and
never fakes success.

### What's real
- **Registration** — real password field, free-text institution, submits to
  `POST /api/auth/register`. Backend now also sends a real welcome email on
  success (see `backend.zip`'s README) — failure to send never blocks
  registration itself.
- **Login** — real `POST /api/auth/login`, no more "any password works."
- **Student dashboard/profile** — fetch real data from `/api/students/me`.
- **Card generator** — state dropdown uses real state IDs; card recording
  to a profile only happens if logged in, never blocks the (frictionless)
  card generation itself.
- **Contact form** — best-effort `POST /api/contact` alongside the mailto
  fallback, which always fires regardless.
- **Admin login** — no more role-picker; the real JWT carries the actual
  role, decoded client-side for UI only (enforcement is server-side).
- **Admin dashboard/Students/States/Cards/Activity/News/Admins** — all
  seven pages call real backend endpoints. News has full CRUD.

### The "honest fallback" pattern, everywhere
`js/live-data.js` wraps every "give me real data" call the same way: try
the live API, and if it's unreachable, fall back to static `MOCK_*` data
so the page still renders — but visibly flags it with a "Showing example
data — couldn't reach the live server" notice, rather than quietly
presenting stale numbers as real.

## Public site
`index.html`, `register.html`, `states.html`, `card.html`, `news.html`,
`about.html`, `contact.html`, `privacy.html`

## Student portal — `login.html`, `dashboard.html`, `profile.html`

## Admin CRM (`/admin/`)
`login.html`, `index.html`, `students.html`, `states.html`, `cards.html`,
`news.html`, `activity.html`, `admins.html` — role-based access (Super
Admin / National Admin / State Coordinator / Content Staff), enforced by
the real backend.

## Structure
```
css/style.css          — shared design tokens and layout
js/mock-data.js         — static fallback data (used only when the live API is unreachable)
js/api-config.js        — API_BASE_URL + apiFetch() — the one place to point at your deployed backend
js/live-data.js         — getLiveStates()/getLiveStats()/getLiveNews()/populateStateSelect()
js/auth.js              — real JWT session handling for the student portal
js/card.js               — card rendering + social share logic (captions, share URLs, Instagram workaround)
js/*.js                 — public + portal page logic

admin/css/admin.css      — admin layout
admin/js/admin-auth.js   — real JWT decoding for role-aware sidebar/topbar
admin/js/*.js            — one file per admin page, all live-wired

images/shrp.jpg          — logo placeholder (still a placeholder)
images/icons/*.svg       — social share icons (Facebook, X, WhatsApp, Instagram)
```

## Known gaps still open
- **Admin Students page** has no per-student detail drawer (backend has no
  single-student detail endpoint yet).
- **Admin Cards page** shows a simplified summary, no per-state breakdown.
- **No password reset flow** anywhere yet.
- Backend gaps (contact form doesn't forward to an inbox yet, no card
  image upload to cloud storage, no rate limiting, no refresh tokens) —
  see `backend/README.md`.

## Logo
Still `images/shrp.jpg`, still a labeled placeholder — swap the file at
that path once you have the real logo.

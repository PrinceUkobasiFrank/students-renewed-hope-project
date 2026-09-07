/*
  Mock data — shaped to match the planned backend response format
  (GET /api/news, GET /api/states) so swapping to the real API later
  is a fetch() call, not a rewrite of the render logic.

  IMPORTANT: this file intentionally contains NO fabricated registration
  or engagement numbers. The platform hasn't launched yet, so registered
  students and cards generated are genuinely 0 everywhere. The one real
  number here is Akwa Ibom's WhatsApp community size, which is tracked
  separately from platform registrations (see community_members below).
*/

const MOCK_STUDENT = {
  id: 1,
  first_name: "Amaka",
  last_name: "Okafor",
  email: "amaka.okafor@example.com",
  phone: "",
  state: "Lagos",
  institution: "University of Lagos",
  level: "300 Level",
  joined: "2026-06-02",
  cards_generated: 2,
  community_joined: true
};
// NOTE: MOCK_STUDENT/MOCK_ACTIVITY below are a UI walkthrough device for the
// student portal demo login only (clearly labeled as a demo on login.html) —
// not a claim about real registered users, unlike the platform-wide stats
// further down this file.

const MOCK_ACTIVITY = [
  { type: "registered", label: "Registered", date: "2026-06-02" },
  { type: "community_clicked", label: "Joined Lagos community", date: "2026-06-03" },
  { type: "card_generated", label: "Generated a supporter card", date: "2026-06-15" },
  { type: "card_generated", label: "Generated a supporter card", date: "2026-08-01" }
];

// ---------- news ----------
// Paraphrased from the project's official Facebook page
// (facebook.com/share/19GyPzkY1h) at the user's request. Not verbatim reposts.
const MOCK_NEWS = [
  {
    id: 1,
    title: "In memory of Comrade Bala Mai Doya, Toro LGA Coordinator",
    excerpt: "The national leadership shared condolences on the passing of the Toro Local Government Coordinator in Bauchi State.",
    body: "Renewed Hope Project 2027's national leadership, led by Director-General Hon. Dauda Salihu, shared condolences with Bauchi State following the passing of Comrade Bala Mai Doya, the Toro Local Government Coordinator. The message described him as a dedicated grassroots mobilizer whose contribution to building the project's structure in Bauchi State will be remembered.",
    category: "community",
    published_at: "2026-08-29"
  },
  {
    id: 2,
    title: "National Student Coordinator recognized for mobilization work",
    excerpt: "Hon. Comr. Gloria Yakubu Suleiman was commended for her student mobilization efforts across the country.",
    body: "The project's leadership publicly commended Hon. Comr. Gloria Yakubu Suleiman, National Student Coordinator, for her grassroots student mobilization work. The announcement referenced a national registration milestone reported on the project's student portal across all 36 states and the FCT — a figure reported by the organization on its own channels, separate from this state-community platform's own registration numbers.",
    category: "community",
    published_at: "2026-08-25"
  },
  {
    id: 3,
    title: "Irobo Youth leadership pays courtesy visit to the DG",
    excerpt: "The FCT chapter of Irobo Youth met with Renewed Hope Project's Director-General to discuss youth mobilization.",
    body: "A delegation led by the Irobo Youth President (FCT Chapter) visited the Renewed Hope Project's national secretariat in Garki, Abuja, meeting with Director-General Hon. Dauda Salihu. The discussion centered on youth engagement, grassroots mobilization, and opportunities for continued collaboration between the two groups.",
    category: "policy",
    published_at: "2026-08-24"
  },
  {
    id: 4,
    title: "\u201cGida zuwa Gida\u201d: a house-to-house mobilization push",
    excerpt: "The DG outlined a grassroots strategy taking the project's message directly to households across the country.",
    body: "Director-General Hon. Dauda Salihu outlined a house-to-house (\"Gida zuwa Gida\") grassroots mobilization strategy, aiming to engage families and communities directly rather than through conventional political gatherings. Coordinators are expected to carry the approach from ward to ward ahead of 2027.",
    category: "policy",
    published_at: "2026-08-23"
  },
  {
    id: 5,
    title: "FCT chapter thanks leaders and stakeholders for their support",
    excerpt: "The FCT Chapter recognized coordinators and stakeholders for their contributions to the project.",
    body: "The FCT Chapter, led by Coordinator Engr. Shittu Usman Chidawa, publicly thanked several state leaders and stakeholders for their support, and reaffirmed its commitment to grassroots mobilization across the Federal Capital Territory.",
    category: "community",
    published_at: "2026-08-19"
  },
  {
    id: 6,
    title: "National secretariat unveiled",
    excerpt: "The project's national secretariat was officially opened shortly after inauguration.",
    body: "Renewed Hope Project 2027 unveiled its national secretariat, marking a formal base for the organization's national coordination activities.",
    category: "community",
    published_at: "2026-08-12"
  }
];

const MOCK_INSTITUTIONS = {
  25: ["University of Lagos", "Lagos State University", "Yaba College of Technology"],
  20: ["Bayero University Kano", "Kano State Polytechnic"],
  33: ["University of Port Harcourt", "Rivers State University"],
  31: ["University of Ibadan", "Ladoke Akintola University of Technology"],
  14: ["University of Nigeria, Nsukka", "Enugu State University of Science and Technology"],
  3: ["University of Uyo", "Akwa Ibom State University"],
  15: ["University of Abuja", "Nile University of Nigeria"],
  19: ["Ahmadu Bello University", "Kaduna State University"]
};

// ---------- states ----------
// students = platform registrations (genuinely 0 everywhere — not launched yet).
// Akwa Ibom is the only state with an active community right now, tracked via
// community_members (real WhatsApp group size) and community_links (both groups).
const MOCK_STATES = [
  { id: 1, name: "Abia", code: "AB", students: 0, status: "pending", community_link: null },
  { id: 2, name: "Adamawa", code: "AD", students: 0, status: "pending", community_link: null },
  { id: 3, name: "Akwa Ibom", code: "AK", students: 0, status: "active", community_link: null,
    community_members: 1900,
    community_links: [
      { label: "Group 1", note: "Nearly full", url: "https://chat.whatsapp.com/DeJpOZc3rmSJ5OYVJeQI7B?s=cl&p=a&ilr=4" },
      { label: "Group 2", note: "Open", url: "https://chat.whatsapp.com/FJQYDyWquoUIhMB5RSiAYK?s=cl&p=a&ilr=4" }
    ]
  },
  { id: 4, name: "Anambra", code: "AN", students: 0, status: "pending", community_link: null },
  { id: 5, name: "Bauchi", code: "BA", students: 0, status: "pending", community_link: null },
  { id: 6, name: "Bayelsa", code: "BY", students: 0, status: "pending", community_link: null },
  { id: 7, name: "Benue", code: "BE", students: 0, status: "pending", community_link: null },
  { id: 8, name: "Borno", code: "BO", students: 0, status: "pending", community_link: null },
  { id: 9, name: "Cross River", code: "CR", students: 0, status: "pending", community_link: null },
  { id: 10, name: "Delta", code: "DE", students: 0, status: "pending", community_link: null },
  { id: 11, name: "Ebonyi", code: "EB", students: 0, status: "pending", community_link: null },
  { id: 12, name: "Edo", code: "ED", students: 0, status: "pending", community_link: null },
  { id: 13, name: "Ekiti", code: "EK", students: 0, status: "pending", community_link: null },
  { id: 14, name: "Enugu", code: "EN", students: 0, status: "pending", community_link: null },
  { id: 15, name: "FCT", code: "FC", students: 0, status: "pending", community_link: null },
  { id: 16, name: "Gombe", code: "GO", students: 0, status: "pending", community_link: null },
  { id: 17, name: "Imo", code: "IM", students: 0, status: "pending", community_link: null },
  { id: 18, name: "Jigawa", code: "JI", students: 0, status: "pending", community_link: null },
  { id: 19, name: "Kaduna", code: "KD", students: 0, status: "pending", community_link: null },
  { id: 20, name: "Kano", code: "KN", students: 0, status: "pending", community_link: null },
  { id: 21, name: "Katsina", code: "KT", students: 0, status: "pending", community_link: null },
  { id: 22, name: "Kebbi", code: "KE", students: 0, status: "pending", community_link: null },
  { id: 23, name: "Kogi", code: "KG", students: 0, status: "pending", community_link: null },
  { id: 24, name: "Kwara", code: "KW", students: 0, status: "pending", community_link: null },
  { id: 25, name: "Lagos", code: "LA", students: 0, status: "pending", community_link: null },
  { id: 26, name: "Nasarawa", code: "NA", students: 0, status: "pending", community_link: null },
  { id: 27, name: "Niger", code: "NI", students: 0, status: "pending", community_link: null },
  { id: 28, name: "Ogun", code: "OG", students: 0, status: "pending", community_link: null },
  { id: 29, name: "Ondo", code: "ON", students: 0, status: "pending", community_link: null },
  { id: 30, name: "Osun", code: "OS", students: 0, status: "pending", community_link: null },
  { id: 31, name: "Oyo", code: "OY", students: 0, status: "pending", community_link: null },
  { id: 32, name: "Plateau", code: "PL", students: 0, status: "pending", community_link: null },
  { id: 33, name: "Rivers", code: "RI", students: 0, status: "pending", community_link: null },
  { id: 34, name: "Sokoto", code: "SO", students: 0, status: "pending", community_link: null },
  { id: 35, name: "Taraba", code: "TA", students: 0, status: "pending", community_link: null },
  { id: 36, name: "Yobe", code: "YO", students: 0, status: "pending", community_link: null },
  { id: 37, name: "Zamfara", code: "ZA", students: 0, status: "pending", community_link: null }
];

// ---------- computed aggregate stats (single source of truth) ----------
// All genuinely 0 pre-launch — computed from MOCK_STATES, not hardcoded,
// so there is no fabricated number anywhere that could drift from this.
const MOCK_TOTAL_STUDENTS = MOCK_STATES.reduce((sum, s) => sum + s.students, 0);
const MOCK_ACTIVE_STATES = MOCK_STATES.filter((s) => s.status === 'active').length;
const MOCK_CARDS_TOTAL = MOCK_STATES.reduce((sum, s) => sum + s.students, 0); // 0 until real cards exist
const MOCK_COMMUNITY_MEMBERS_TOTAL = MOCK_STATES.reduce((sum, s) => sum + (s.community_members || 0), 0);

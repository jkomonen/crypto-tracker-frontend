// Single source of truth for the API origin. The backend is a free Render web
// service, so it sleeps after inactivity — see boot-gate.component.js for how
// the cold start is presented to the user.
const API_BASE = 'https://cryptocurrency-portfolio-tracker-api.onrender.com';

export default API_BASE;

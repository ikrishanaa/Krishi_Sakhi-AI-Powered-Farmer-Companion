# Pending Tasks and Testing Queue

Created: 2025-09-17 13:42 UTC
Owner: Team Krishi Mitra

Purpose
- Track items waiting on external activation, verification, or inputs.
- Keep a prioritized list of the next most important tasks to ship the MVP.

Blocked / Waiting
- Weather provider
  - Provider: Open-Meteo
  - Status: Integrated; no API key required
  - Action:
    - Test: GET /api/weather?state=KERALA&city=KANNUR
    - Test: GET /api/weather?lat=10&lon=76
    - Verify /weather page loads and advisories appear

Testing Queue (run as soon as ready)
- Locations endpoints
  - /api/locations/states, /api/locations/cities?state=KERALA, /api/locations/constituencies?state=KERALA&city=KANNUR
- Auth flows
  - User OTP demo flow (000000)
  - Admin password login (officer@kerala.gov.in / ChangeMe!123)
- Admin features
  - Broadcast (with new State/City/Constituency filters once implemented)
  - Analytics and Geo Analytics pages
- Frontend pages
  - /submit (state/city/constituency dropdowns)
  - /weather (geolocation allowed and denied cases)
  - /admin (stats/weekly issues)

High Priority Next (most valuable with no external dependencies)
1) Admin broadcast targeting by location
   - Backend: allow filters (state/city/constituency) and deliver only to matching users
   - Frontend: add selectors to Admin dashboard broadcast UI
   - Outcome: relevant advisories for targeted regions
2) User alerts page
   - Frontend: simple page to list alerts for the logged-in user (later surfaced in UI)
   - Backend: reuse existing Alert table (no new endpoints immediately; may add later for user-specific fetch)
3) Favicon
   - Add app/icon.svg to Next app to remove 404s and improve polish

Medium Priority
- Chat endpoint (POST /api/chat/query) once LLM key is available
- Pest detection endpoint (image upload + advisory) once model choice is made
- Constituency filter in geo analytics; add DB index on User(constituency)

Low Priority / Polish
- i18n strings for pages (Malayalam/Punjabi/Hindi)
- Structured logging and rate limiting for production readiness

Inputs needed from team
- LLM provider choice and key (e.g., GEMINI_API_KEY)
- Vision/model choice for pest detection
- Any localization text or advisory thresholds you prefer

Notes
- Keep this file updated as tasks move from ‘Blocked’ → ‘Testing’ → ‘Done’.
# Krishi Mitra — Progress Journal

Created: 2025-09-17 12:59 UTC
Location: /progress.md (project root)
Owner: Team Krishi Mitra

Purpose
- Track day-to-day engineering progress, key decisions, and next steps.
- Serve as a single source of truth during the MVP build and demo.

Summary of the current state (as of 2025-09-17)
- Backend (Node/Express/Prisma)
  - Health check at GET /health.
  - Friendly landing at GET / with name/status/ts/endpoints.
  - Auth (farmer) with OTP and demo mode; Admin auth (password/OTP) with allowed domains.
  - Admin: analytics (stats/weekly issues) and broadcast.
  - Locations: states, cities, and constituencies served from offline dataset.
  - Prisma schema/migrations applied; DB operational.
- Frontend (Next.js)
  - Pages: home, login (user/admin), submit (with state/city/constituency), chat, pest detection, admin dashboard, geo analytics.
  - Uses /api proxy in dev.
- Data
  - New_DataSet.json (simple array of { state, city, constituency }) used as offline source.
  - Pincode concept removed for MVP.

Timeline (UTC)
- 10:19 — Investigated 404; confirmed global 404 handler; added GET / landing response.
- 10:46 — Fixed Prisma DB mismatch (User.pin_code not found) by applying pending migrations.
- 11:03 — Decision: drop pincode; adopt State → City → Constituency flow and simple dataset format.
- 11:20 — Implemented:
  - Extended offline loader to index states/cities/constituencies from New_DataSet.json.
  - Added GET /api/locations/constituencies?state=&city=.
  - Frontend submit page updated to third dropdown; removed pincode field/logic.
- 11:39 — Bugfix: constituencies endpoint returned []; corrected loader, verified KANNUR returns non-empty set.
- 11:30–12:01 — Cleanup:
  - Removed pincode demo tile and redirected /demo/pincode → /submit.
  - Deleted pincode code files and sample JSONs (see Deletions below).
- 12:19 — Clean build:
  - Cleaned server/dist.
  - Installed type packages: @types/morgan, @types/bcryptjs.
  - Fixed jwt.sign typings and fallback loader null checks; tsc build green.
- 12:57 — Seeded demo admin account; admin password login works.

Key changes (code)
- Added landing route: server/src/app.ts → GET / returns API info.
- Locations backend:
  - server/src/services/LocationFallback.ts — now indexes states, cities, and constituencies from New_DataSet.json (and LOCATION_FALLBACK_FILE if provided). Also supports legacy pin-based rows for compatibility.
  - server/src/api/controllers/LocationsController.ts — new constituencies handler.
  - server/src/api/routes/locations.ts — wired GET /constituencies.
- Frontend:
  - client/src/services/locationService.ts — added fetchConstituencies(state?, city?).
  - client/src/app/submit/page.tsx — added Constituency dropdown; removed pincode logic.
  - client/src/app/page.tsx — removed “Pincode Demo” tile.
  - client/src/app/demo/pincode/page.tsx — redirects to /submit.
- Admin seed:
  - server/src/database/seeds/admin_seed.ts — used to create demo admin.
- Build hygiene:
  - server/src/config/jwt.ts — fixed jsonwebtoken types.
  - Cleaned server/dist and achieved clean tsc build.

Deletions (to reduce confusion)
- Backend files removed:
  - server/src/api/routes/pincode.ts
  - server/src/api/controllers/PincodeController.ts
  - server/src/services/PincodeService.ts
- Frontend file removed:
  - client/src/services/pincodeService.ts
- Sample datasets removed:
  - dATASET_PINCODE.json
  - sample-response-from.gov-in.json

Verification commands (dev)
- Backend up: npm run dev (in server) or npm --prefix "./server" run dev
- Health & landing:
  - curl http://localhost:4000/health
  - curl http://localhost:4000/
- Locations:
  - curl "http://localhost:4000/api/locations/states"
  - curl "http://localhost:4000/api/locations/cities?state=KERALA"
  - curl "http://localhost:4000/api/locations/constituencies?state=KERALA&city=KANNUR"
- Admin login (password):
  - POST http://localhost:4000/api/admin/login { email, password }

Decisions
- Keep API and client decoupled (backend serves APIs; client runs on its own port/domain in dev).
- Replace pincode-based UX with State → City → Constituency using a flat JSON dataset for the MVP.

Progress update (weather)
- Added backend weather + advisory integration:
  - server/src/services/WeatherService.ts (Open-Meteo forecast, in-memory TTL cache, optional geocoding when state/city provided).
  - server/src/api/controllers/WeatherController.ts and routes at /api/weather.
  - server/src/services/AdvisoryEngine.ts with /api/advisory endpoint for rule-based advisories.
  - Environment schema includes WEATHER_UNITS, WEATHER_CACHE_TTL_SECONDS, WEATHER_DEFAULT_LAT/LON (no API key required).
- Added frontend page:
  - client/src/app/weather/page.tsx using geolocation fallback to State/City.
- Configuration placed in server/.env (units, TTL, optional default lat/lon; no provider or API key needed).

Open items / Next steps
1) Weather (fast win)
   - Backend: GET /api/weather?lat=&lon=&state=&city= with 5–15 min cache.
   - Frontend: /weather page showing current + near-term forecast and advisories.
   - Note: Using Open-Meteo (no API key needed). Decide which fields to surface (temp, RH, POP, warnings equivalent).
2) Chat Q&A
   - Backend: POST /api/chat/query to LLM (Gemini); concise structured output.
   - Frontend: wire the existing /chat page.
   - Needs: GEMINI_API_KEY and any guardrails/prompt constraints.
3) Pest detection
   - Backend: POST /api/predict/pest (multer) for image + optional crop/notes/lat/lon; returns advisory.
   - Frontend: /pest-detection already posts FormData.
   - Needs: Vision/LLM provider choice and example prompts.
4) Admin enhancements
   - Filter broadcasts by State/City/Constituency.
   - Add a user alerts page to view broadcasts.
5) Analytics polish
   - Added Constituency filter to geo analytics; index on User(constituency) created.
6) UX polish
   - Add favicon to remove /favicon.ico 404s; i18n strings where helpful.
7) Production readiness (as time permits)
   - Rate limiting, CORS allow-list, structured logging, OTP provider (Twilio), secret management.

What we need from the team
- API keys as environment variables (not in plain text):
  - GEMINI_API_KEY (or other LLM provider)
  - SMS provider credentials (if moving beyond demo OTP)
- Data normalization pass on New_DataSet.json (fix typos like KALLLIASSERI/IKKUR vs IRIKKUR) and confirm allowed states list.
- Any UX preferences for the /weather page and advisory wording.

How to update this journal
- Append new entries under Timeline and update Summary/Next steps as features land.
- Keep entries short, dated, and actionable.

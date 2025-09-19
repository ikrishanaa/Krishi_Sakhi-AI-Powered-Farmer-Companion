# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

Project: Krishi Mitra (client: Next.js 14, server: Node/Express/Prisma, DB: Postgres)

Quick start (local dev)
- Prereqs: Node >= 18.17, Docker
- Install deps
  - Server: cd server && npm install
  - Client: cd client && npm install
- Start Postgres
  - docker compose up -d postgres
- Apply Prisma schema (server)
  - cd server
  - npm run prisma:generate
  - npm run prisma:migrate
- Run dev servers
  - Server (http://localhost:4000): cd server && npm run dev
  - Client (http://localhost:3000): cd client && npm run dev

Common commands
- Server (from server/)
  - Dev: npm run dev
  - Build: npm run build
  - Start (built): npm start
  - Lint: npm run lint
  - Format: npm run format
  - Typecheck: npm run typecheck
  - Tests: npm test
  - Tests (watch): npm run test:watch
  - Coverage: npm run test:coverage
  - Prisma: npm run prisma:generate | npm run prisma:migrate | npm run prisma:deploy
  - Seed demo admin (requires ADMIN_DEMO_EMAIL env): npm run seed
- Client (from client/)
  - Dev: npm run dev
  - Build: npm run build
  - Start (built): npm start
  - Lint: npm run lint
  - Tests: npm test
  - Coverage: npm run test:coverage

Run a single test (Jest)
- Match by file path: npm test -- ./path/to/file.test.ts
- Match by name: npm test -- -t "partial test name"

Environment configuration
- Server defaults (see server/src/config/environment.ts) are safe for local dev
  - PORT: 4000
  - DATABASE_URL: postgresql://postgres:postgres@localhost:5432/krishi_mitra?schema=public
  - DEMO_MODE: true (OTP bypass and demo SMS)
  - CORS_ORIGIN: *
  - JWT_SECRET, JWT_EXPIRES_IN: has defaults (override in non-dev)
  - Weather: Open-Meteo integration (no API key required). Optional: WEATHER_DEFAULT_LAT, WEATHER_DEFAULT_LON; units via WEATHER_UNITS (metric|imperial|standard)
  - Optional admin demo: ADMIN_DEMO_EMAIL, ADMIN_DEMO_PASSWORD, ADMIN_DEMO_OTP
- Client API base (client/.env.local)
  - NEXT_PUBLIC_API_BASE=http://localhost:4000/api (bypasses Next rewrites). If unset, client uses /api which proxies to :4000 via next.config.js

Data and database
- Postgres via docker-compose (service: postgres). Persistent volume: pgdata
- Prisma schema at server/src/database/schema.prisma
- Migrations live under server/src/database/migrations
- First-time setup: start DB, then run prisma:generate and prisma:migrate
- Optional: seed demo admin with npm run seed (requires ADMIN_DEMO_EMAIL set)

How things are wired (high-level architecture)
- Frontend (client/)
  - Next.js 14 App Router (src/app/*) with i18n (en, hi, ml, pa)
  - API access via Axios instance (src/services/api.ts):
    - JWT persisted in localStorage (key: km_token); interceptor attaches Authorization: Bearer
    - Base URL from NEXT_PUBLIC_API_BASE or /api (Next rewrite to backend)
  - Feature services map to backend routes:
    - Auth: src/services/authService.ts -> POST /api/auth/otp, /api/auth/login
    - Admin auth: src/services/adminAuthService.ts -> POST /api/admin/login
    - Admin analytics/broadcast: src/services/adminService.ts -> GET /api/admin/analytics/*, POST /api/admin/broadcast
    - Locations: src/services/locationService.ts -> /api/locations/*
    - Weather: UI pages call /api/weather via services; advisories fetched from /api/advisory
    - Chat and pest services call /api/chat/query and /api/predict/pest respectively (requires GEN_AI_API_KEY; no demo fallback)
    - Market: client/src/app/market-trends calls /api/market/crops and /api/market/trends (mock data)
  - App router pages include: auth/login, admin/login, weather, pest-detection, submit, chat, admin/geo (see src/app/*)
  - i18n config: client/next-i18next.config.js; Next rewrites proxy /api/* -> http://localhost:4000/api/* in dev

- Backend (server/)
  - Express app (src/app.ts) mounts feature routers under /api/* and sets security, CORS, logging, body parsing
  - Entry (src/index.ts) creates HTTP server on env.PORT (default 4000) with graceful shutdown
  - Config
    - env validation: src/config/environment.ts (zod with sensible dev defaults)
    - Prisma client and lifecycle: src/config/database.ts
    - JWT helpers: src/config/jwt.ts
  - Middleware
    - Authentication/authorization: src/middleware/auth.ts (requireAuth, requireAdmin)
  - Routes and controllers (selected implemented modules)
    - /api/auth: request OTP and login (src/api/controllers/AuthController.ts)
      - AuthService handles OTP generation, storage, expiry, and JWT issuance (src/services/AuthService.ts)
      - SMSService uses Twilio if configured; falls back to demo mode otherwise (src/services/SMSService.ts)
    - /api/admin/login: admin login via password or demo OTP (src/api/controllers/AdminAuthController.ts, src/services/AdminAuthService.ts)
    - /api/admin/analytics: basic stats and weekly issues using Prisma aggregations (src/api/controllers/AdminAnalyticsController.ts)
    - /api/admin/broadcast: create Alert records for all users (src/api/controllers/AdminBroadcastController.ts)
    - /api/admin/geo-analytics: aggregate users by state/city/constituency with raw SQL (src/api/controllers/AdminGeoAnalyticsController.ts)
    - /api/users (public intake): upsert user by phone and save location fields (src/api/controllers/UserPublicController.ts)
    - /api/locations: states/cities/constituencies with offline fallback datasets (src/api/controllers/LocationsController.ts, src/services/LocationFallback.ts)
    - /api/weather: Open-Meteo forecast + geocoding adapter with TTL cache (src/services/WeatherService.ts)
  - Data model (Prisma)
    - Core entities: User, Farm, CropCycle, Activity, AdvisoryRule, Alert, Admin (see schema.prisma)

Local routing and integration notes
- Client dev server runs on :3000 and proxies /api/* to backend :4000 in dev (next.config.js)
- Client services can bypass proxy with NEXT_PUBLIC_API_BASE=http://localhost:4000/api
- Authentication
  - User OTP: DEMO_MODE true allows login with OTP 000000 (see environment.ts)
  - Admin: only domains in ADMIN_ALLOWED_DOMAINS are allowed for password logins; demo OTP flow available when ADMIN_DEMO_EMAIL is set
- Weather
  - Uses Open-Meteo (no API key). Optionally set WEATHER_DEFAULT_LAT and WEATHER_DEFAULT_LON for fallback

Troubleshooting
- Prisma errors: ensure Postgres is running and DATABASE_URL matches docker-compose
- Weather 400: provide valid lat/lon or resolvable state/city; optionally set WEATHER_DEFAULT_LAT and WEATHER_DEFAULT_LON
- Admin login forbidden: check ADMIN_ALLOWED_DOMAINS and (for OTP) ADMIN_DEMO_EMAIL/ADMIN_DEMO_OTP
- Chat/Pest 503: set GEN_AI_API_KEY in server environment; both endpoints require a valid LLM key (no demo fallback)

Repository docs worth reading
- PROJECT_STRUCTURE.md: broader, forward-looking structure; current implementation is a subset
- TESTING.md: comprehensive testing strategy (Jest/RTL/Cypress). Current repo provides Jest scripts; add configs as needed
- HARDWARE_INTEGRATION.md: rationale for software-only approach
- MILESTONES.md: phased feature plan and test commands

Notes for agents
- Prefer non-interactive commands and avoid pagers (e.g., git --no-pager ...)
- When changing server DB schema, run prisma:generate and prisma:migrate, and restart the dev server
- Respect DEMO_MODE in local flows; do not attempt real SMS without Twilio credentials
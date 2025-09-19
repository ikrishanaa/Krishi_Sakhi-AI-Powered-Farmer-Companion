# Feature Backlog and PWA/Responsive Enhancements (Frontend-first)

Purpose
- Capture new feature ideas and UI/PWA improvements to keep the app fast, responsive, and hackathon-ready
- Clearly mark which items are frontend-only and require backend APIs later
- Prioritize features that demo well offline and on low-end devices

Scope
- Unless explicitly stated, the items below are FRONTEND-ONLY STUBS and will need backend support later.

---

PWA Readiness Checklist (Frontend)
- Service Worker and Caching (frontend only)
  - Precaching: shell, fonts, icons, critical JS/CSS
  - Runtime caching: images, /api/weather, /api/locations, /api/market (stale-while-revalidate)
  - Offline fallback routes: “/offline” page for navigation failures
  - Background sync (queued POSTs for submit forms, pest uploads)
  - Deferred: use Workbox or next-pwa for reliable SW generation
- Manifest and Installability
  - App name, icons (192/512), theme_color/background_color
  - Custom install banner CTA on landing page
- Push Notifications (deferred)
  - Show local notifications for severe weather or market thresholds (frontend mock now)
  - Backend later: subscription storage, VAPID, broadcast
- Performance & UX
  - Skeletons and shimmer placeholders for lists/cards/charts
  - Route-level Suspense and streaming where useful
  - Prefetch critical routes when idle
  - Lazy-load heavy bundles (charts, maps)
  - Always test on small screens and 3G throttling

Responsive UI Enhancements
- Mobile-first Cards grid with larger tap areas (44x44 minimum)
- High-contrast theme defaults (dark text on light background)
- Reduced-motion option via CSS (prefers-reduced-motion)
- Consistent iconography: lucide-based icons for sections/features
- Chart containers with fixed heights and memoized options to avoid layout thrash
- Use locale-aware number/date/currency formatting everywhere

---

Feature Backlog (Frontend-first stubs)

1) Market Watchlist & Alerts
- Frontend
  - Watchlist UI: star/favorite crops; card on dashboard showing current avg price and delta
  - Notifications banner (frontend mock) when threshold crossed
- Backend (later)
  - /api/market/watchlist (CRUD), per-user threshold alerts; server cron to check and broadcast
- Status: In progress (frontend stub ready; backend required)

2) Advisory Timeline & Actions
- Frontend
  - Timeline on dashboard: past advisories and “mark done” actions (e.g., applied irrigation)
  - Filter by crop; voice “read timeline” button
- Backend (later)
  - Persist advisories delivered + user actions table
- Status: Planned (frontend stub OK; backend required)

3) Community Geo Map (Admin & Public)
- Frontend
  - Map view by constituency with counts of users/alerts (read only)
  - Toggle layers (users, alerts)
- Backend (later)
  - Aggregated counts; optional geocoding for centroids
- Status: Planned (frontend stub OK; backend required)

4) Voice Everywhere & Handsfree Mode
- Frontend
  - Voice mic buttons on all major flows (done: Chat/Weather/Pest/Market summary)
  - Handsfree mode toggle: auto-read advisories / results
- Backend (optional)
  - Cloud STT/TTS for reliability when browser APIs are limited
- Status: In progress (frontend mostly done; cloud STT/TTS pending if needed)

5) Crop Diary (Offline-first)
- Frontend
  - Simple diary entries: date, activity, notes, photo
  - Offline queue and sync later
- Backend (later)
  - /api/diary (CRUD), media storage
- Status: Planned (frontend stub OK; backend required)

6) Offline Submission Queue
- Frontend
  - Queue POSTs (submit form, pest upload metadata) while offline; sync when online
- Backend
  - No change required; ensure server idempotency on retries
- Status: Planned (frontend only)

7) Severe Weather Push (Mock)
- Frontend
  - Mock local notification when advisory severity=critical and user opts in
- Backend (later)
  - True push: endpoints to save subscriptions, send notifications
- Status: Planned (frontend mock OK; backend required)

8) QR Farmer ID (Offline)
- Frontend
  - Generate QR with farmer public profile summary and contact
- Backend (later)
  - Optional deep link endpoint to resolve QR code IDs to full profile
- Status: Planned (frontend stub OK; backend optional)

9) Multi-account (Family Switching)
- Frontend
  - Dropdown to switch between saved accounts (local secure storage); separate JWT storage keys
- Backend (later)
  - Policy rules for delegated access (optional)
- Status: Planned (frontend stub OK; backend optional)

10) Help Center & Offline Guides
- Frontend
  - Contextual tips and offline guides (images+text) for common issues (irrigation, fertilizers)
- Backend (later)
  - Content CMS endpoint (optional); can ship static content for hackathon
- Status: Planned (frontend only)

11) Feedback Widget
- Frontend
  - Simple “feedback” panel; voice-to-text option; stores offline until sent
- Backend (later)
  - /api/feedback endpoint
- Status: In progress (frontend page queues feedback offline; backend required)

12) Data Saver Mode
- Frontend
  - Toggle to lower image quality, disable auto-chart animations, avoid prefetching
- Backend
  - None
- Status: In progress (frontend-only toggle added)

13) Network Status Indicator
- Frontend
  - Show online/offline pill with sync state; warn during heavy actions
- Backend
  - None
- Status: Planned (frontend only)

14) What’s New (Changelog)
- Frontend
  - Modal/page for latest updates and known limitations
- Backend
  - None (use static JSON or markdown content)
- Status: Planned (frontend only)

---

Implementation Notes
- PWA tech: next-pwa or custom Workbox config; start with minimal SW for pre-cache + runtime caching
- Offline page: create /offline with helpful tips and a “retry” action
- Background sync: use Background Sync API where supported; fallback with retry on next app open
- Image handling: client-side compression for pest uploads (e.g., browser-image-compression)
- Accessibility: ensure focus states, ARIA labels for mic buttons, and readable language
- Performance: avoid heavy animations on low-end devices (prefers-reduced-motion)

Responsive Design Checklist
- Verify layouts at 360px, 768px, 1024px, 1280px
- Cards: minimum tap area; wrap text; avoid text overflow in translations
- Charts: fixed-height parent, memoized options, lazy import

---

Prioritized Next Steps (Hackathon)
1) PWA minimal: manifest + SW with pre-cache and runtime caching for weather/locations
2) Offline page and skeleton loaders for Weather/Market/Admin pages
3) Market Watchlist frontend stub + dashboard card
4) Advisory Timeline frontend stub on dashboard
5) QR Farmer ID generator (frontend only)
6) Data Saver toggle
7) Feedback widget (frontend stub)

Non-goals (for now)
- Full push notification backend
- Cloud STT/TTS integration
- Complex multi-tenant admin controls

Status Legend
- Planned: not started
- In progress: frontend ongoing
- Frontend only: no backend required
- Requires backend: awaiting APIs

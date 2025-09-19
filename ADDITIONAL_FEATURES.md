# Additional Features and Roadmap

Project: Krishi Mitra (Next.js 14 client, Node/Express/Prisma server)

Summary
- Focus: high-quality offline/PWA behavior, low-data UX, i18n, and admin insights.
- Status notation: Frontend (F), Backend (B). Values: Ready, Partial, Planned.

PWA and Offline
- App icons (192/512 PNG) for installability (F: Planned, B: N/A)
- Offline shell and key routes cached with SW (F: Ready, B: N/A)
- Offline fallback page (/offline) polish (F: Partial, B: N/A)
- Background sync for queued actions (submit/feedback) (F: Planned, B: Planned)
- Periodic background sync (stale-while-revalidate) for weather snippet (F: Planned, B: Ready)

Low-Data / Data Saver
- Global Data Saver toggle (in header) (F: Ready)
- Charts thin out data + hide legends (Market Trends) (F: Ready)
- Image compression prior to upload (Pest Detection) (F: Ready)
- Progressive images and lazy-loading (F: Planned)
- Voice/TTS short summaries under Data Saver (F: Planned)

Internationalization (i18n)
- Base keys and translations (en, hi, ml, pa) (F: Ready)
- Expand coverage across all pages (F: Partial)
- Language switcher UI improvements (F: Planned)
- RTL support readiness (if future locales) (F: Planned)

Accessibility (a11y)
- Keyboard navigation and focus outlines (F: Planned)
- Descriptive alt/labels for icons and charts (F: Planned)
- Live region announcements for async loads (F: Planned)

Admin and Analytics
- Geo Analytics: chart toggles + Top-N (F: Ready)
- Geo Analytics: date range and export CSV (F: Planned, B: Planned)
- Alerts: read/unread states and filters (F: Planned, B: Planned)

Weather and Advisories
- Advisory severity localization and TTS (F: Ready)
- More crop-specific advisory rules (F: Planned, B: Planned)
- Weather caching and error handling improvements (F: Planned, B: Ready)

Market Trends
- Timeframe selector (7/30/90/365d) (F: Planned, B: Planned)
- Local caching + stale indicators (F: Planned)
- Skeleton loading states (F: Planned)

Security and Performance
- Strict Content Security Policy and headers (F: Planned, B: Ready)
- Rate limiting and input validation on API (B: Planned)
- Bundle size budget and code-splitting for heavy pages (F: Planned)

Testing
- Unit tests for services and hooks (F: Planned)
- Integration tests for pages (F: Planned)
- E2E smoke for PWA install and offline path (F: Planned)

Immediate Next Candidates
1) Add PWA icons (192x192, 512x512) under client/public/icons and confirm installability
2) Expand i18n coverage across Dashboard, Alerts, Admin pages
3) Add skeleton loaders and refine offline fallback

Notes
- When adding DB schema changes (server), run prisma:generate and prisma:migrate and restart backend.
- Respect DEMO_MODE and avoid real SMS without Twilio.

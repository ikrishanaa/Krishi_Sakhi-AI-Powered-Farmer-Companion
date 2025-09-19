# Krishi Mitra - Development Milestones & Testing Plan

## Overview
This document breaks down the Krishi Mitra development into logical, sequential milestones optimized for hackathon delivery while maintaining production-ready architecture.

---

## **Milestone 1: Foundation & Authentication System**
**Duration:** 2-3 days | **Priority:** Critical - Core Infrastructure

### Primary Features:
- Project setup and basic infrastructure
- User authentication (SMS OTP + Demo mode)
- Database schema and models
- Basic UI framework with accessibility features
- Malayalam/Hindi/English i18n setup

### Files to Create/Modify:

**Backend Infrastructure:**
- `server/package.json` - Backend dependencies and scripts
- `server/src/config/database.ts` - PostgreSQL connection setup
- `server/src/config/environment.ts` - Environment variable management
- `server/src/database/schema.prisma` - Complete database schema
- `server/src/models/User.ts` - User model definition
- `server/src/models/index.ts` - Model exports and associations

**Authentication System:**
- `server/src/services/AuthService.ts` - Authentication business logic
- `server/src/services/SMSService.ts` - Twilio SMS/OTP handling
- `server/src/api/controllers/AuthController.ts` - Auth request handlers
- `server/src/api/routes/auth.ts` - Authentication endpoints
- `server/src/middleware/auth.ts` - JWT authentication middleware
- `server/src/api/validators/authValidators.ts` - Auth validation schemas

**Frontend Foundation:**
- `client/package.json` - Frontend dependencies and scripts
- `client/next.config.js` - Next.js configuration with PWA settings
- `client/tailwind.config.js` - Tailwind CSS with accessibility defaults
- `client/src/app/layout.tsx` - Root layout with providers
- `client/src/app/globals.css` - Global styles and accessibility CSS

**UI Component System:**
- `client/src/components/ui/Button.tsx` - Accessible button component
- `client/src/components/ui/Input.tsx` - Form input with validation
- `client/src/components/ui/Card.tsx` - Content container component
- `client/src/components/ui/Loading.tsx` - Loading spinner component
- `client/src/components/ui/Toast.tsx` - Notification system

**Authentication UI:**
- `client/src/contexts/AuthContext.tsx` - Authentication state management
- `client/src/hooks/useAuth.ts` - Authentication logic hook
- `client/src/services/api.ts` - Axios instance with interceptors
- `client/src/services/authService.ts` - Authentication API calls
- `client/src/app/auth/login/page.tsx` - Phone number entry page
- `client/src/app/auth/verify/page.tsx` - OTP verification page
- `client/src/app/auth/demo/page.tsx` - Demo mode bypass page
- `client/src/components/forms/LoginForm.tsx` - Phone + OTP form component

**Internationalization:**
- `client/src/lib/i18n.ts` - i18n configuration setup
- `client/public/locales/en/common.json` - English UI strings
- `client/public/locales/hi/common.json` - Hindi UI strings
- `client/public/locales/ml/common.json` - Malayalam UI strings
- `client/src/contexts/LanguageContext.tsx` - Language state management

**Testing Files:**
- `server/__tests__/api/auth.test.ts` - Authentication API tests
- `server/__tests__/services/AuthService.test.ts` - Auth service unit tests
- `client/__tests__/components/LoginForm.test.tsx` - Login form tests
- `client/__tests__/hooks/useAuth.test.ts` - Auth hook tests

---

## **Milestone 2: User Onboarding & Farm Management**
**Duration:** 1-2 days | **Priority:** Critical - Core User Flow

### Primary Features:
- User profile creation and management
- Farm registration with location mapping
- Basic navigation and dashboard structure
- Kerala-specific crop and soil type data

### Files to Create/Modify:

**Backend Farm System:**
- `server/src/models/Farm.ts` - Farm model definition
- `server/src/services/GeolocationService.ts` - Kerala district mapping
- `server/src/api/controllers/FarmController.ts` - Farm management logic
- `server/src/api/routes/farms.ts` - Farm management endpoints
- `server/src/api/validators/farmValidators.ts` - Farm validation schemas
- `server/src/database/seeds/kerala_data.ts` - Kerala districts and crop data

**Frontend Onboarding:**
- `client/src/app/onboarding/page.tsx` - Onboarding flow coordinator
- `client/src/app/onboarding/profile/page.tsx` - Profile setup step
- `client/src/app/onboarding/farm/page.tsx` - Farm setup step
- `client/src/components/forms/ProfileForm.tsx` - User profile form
- `client/src/components/forms/FarmForm.tsx` - Farm details form
- `client/src/components/features/MapPicker.tsx` - Location selection map

**Dashboard & Navigation:**
- `client/src/app/page.tsx` - Main dashboard/home page
- `client/src/components/layout/Header.tsx` - App header with navigation
- `client/src/components/layout/BottomNav.tsx` - Mobile bottom navigation
- `client/src/contexts/UserProfileContext.tsx` - User profile state
- `client/src/hooks/useGeolocation.ts` - Device location access

**Farm Management:**
- `client/src/app/farms/page.tsx` - Farm list page
- `client/src/app/farms/new/page.tsx` - Add new farm page
- `client/src/app/farms/[id]/page.tsx` - Farm detail/edit page
- `client/src/services/farmService.ts` - Farm API calls

**Testing Files:**
- `server/__tests__/api/farms.test.ts` - Farm API endpoint tests
- `server/__tests__/services/GeolocationService.test.ts` - Location service tests
- `client/__tests__/components/FarmForm.test.tsx` - Farm form tests
- `client/__tests__/hooks/useGeolocation.test.ts` - Geolocation hook tests

---

## **Milestone 3: Weather Integration & Advisory Engine Core**
**Duration:** 2-3 days | **Priority:** Critical - Core Intelligence

### Primary Features:
- Open-Meteo API integration for Kerala
- Rule-based advisory engine implementation
- Weather alerts and recommendations
- Basic chatbot interface with structured queries

### Files to Create/Modify:

**Weather System:**
- `server/src/services/WeatherService.ts` - Open-Meteo integration
- `server/src/api/controllers/WeatherController.ts` - Weather data handling
- `server/src/api/routes/weather.ts` - Weather endpoints
- `server/src/models/Alert.ts` - Alert model definition
- `server/src/services/AlertService.ts` - Alert generation logic

**Advisory Engine:**
- `server/src/models/AdvisoryRule.ts` - Advisory rule model
- `server/src/services/AdvisoryEngine.ts` - Rule-based advisory logic
- `server/src/api/controllers/AdvisoryController.ts` - Advisory API handlers
- `server/src/api/routes/advisory.ts` - Advisory endpoints
- `server/src/database/seeds/advisory_rules.ts` - Kerala crop advisory rules

**Weather Alerts:**
- `server/src/services/CronService.ts` - Scheduled weather checks
- `server/src/api/controllers/AlertController.ts` - Alert management
- `server/src/api/routes/alerts.ts` - Alert endpoints

**Frontend Weather & Advisory:**
- `client/src/hooks/useWeather.ts` - Weather data fetching
- `client/src/hooks/useAdvisory.ts` - Advisory engine interaction
- `client/src/components/features/WeatherCard.tsx` - Weather display
- `client/src/components/features/AlertCard.tsx` - Alert notifications
- `client/src/services/weatherService.ts` - Weather API calls
- `client/src/services/advisoryService.ts` - Advisory API calls

**Chatbot Interface:**
- `client/src/app/chat/page.tsx` - Chat interface page
- `client/src/components/features/ChatInterface.tsx` - Chat UI component
- `client/public/locales/*/advisory.json` - Advisory text translations

**Testing Files:**
- `server/__tests__/services/WeatherService.test.ts` - Weather service tests
- `server/__tests__/services/AdvisoryEngine.test.ts` - Advisory engine tests
- `client/__tests__/components/WeatherCard.test.tsx` - Weather UI tests
- `client/__tests__/hooks/useAdvisory.test.ts` - Advisory hook tests

---

## **Milestone 4: Activity Tracking & Crop Cycle Management**
**Duration:** 1-2 days | **Priority:** High - Core Functionality

### Primary Features:
- Crop cycle creation and management
- Activity logging (sowing, irrigation, fertilizer, etc.)
- Activity history and farm diary
- Reminder system for future activities

### Files to Create/Modify:

**Backend Activity System:**
- `server/src/models/CropCycle.ts` - Crop cycle model
- `server/src/models/Activity.ts` - Activity model
- `server/src/api/controllers/CropController.ts` - Crop cycle logic
- `server/src/api/controllers/ActivityController.ts` - Activity logging
- `server/src/api/routes/crops.ts` - Crop cycle endpoints
- `server/src/api/routes/activities.ts` - Activity endpoints
- `server/src/api/validators/cropValidators.ts` - Crop validation
- `server/src/api/validators/activityValidators.ts` - Activity validation

**Frontend Activity System:**
- `client/src/app/activities/page.tsx` - Activity list view
- `client/src/app/activities/new/page.tsx` - Log activity form
- `client/src/app/activities/[id]/page.tsx` - Activity detail view
- `client/src/components/forms/ActivityForm.tsx` - Activity logging form
- `client/src/components/features/ActivityList.tsx` - Activity history
- `client/src/components/features/CropCycleCard.tsx` - Crop cycle display
- `client/src/services/activityService.ts` - Activity API calls

**Testing Files:**
- `server/__tests__/api/crops.test.ts` - Crop cycle API tests
- `server/__tests__/api/activities.test.ts` - Activity API tests
- `client/__tests__/components/ActivityForm.test.tsx` - Activity form tests

---

## **Milestone 5: Mock ML Services & Market Data**
**Duration:** 1-2 days | **Priority:** Medium - Demo Features

### Primary Features:
- Mock pest detection service with image upload
- Mock market trends data for Kerala crops
- Market price visualization charts
- Image upload and processing simulation

### Files to Create/Modify:

**Backend Mock Services:**
- `server/src/services/PestService.ts` - Mock pest detection service
- `server/src/services/MarketService.ts` - Mock market data service
- `server/src/api/controllers/PestController.ts` - Pest detection API
- `server/src/api/controllers/MarketController.ts` - Market data API
- `server/src/api/routes/pest.ts` - Pest detection endpoints
- `server/src/api/routes/market.ts` - Market data endpoints
- `server/src/database/seeds/market_data.ts` - Kerala crop price data

**Frontend Mock Features:**
- `client/src/app/pest-detection/page.tsx` - Pest detection interface
- `client/src/app/market-trends/page.tsx` - Market trends page
- `client/src/components/features/PestUpload.tsx` - Image upload component
- `client/src/components/features/MarketChart.tsx` - Price chart component
- `client/src/services/pestService.ts` - Pest detection API calls
- `client/src/services/marketService.ts` - Market data API calls

**Testing Files:**
- `server/__tests__/services/PestService.test.ts` - Pest service tests
- `server/__tests__/services/MarketService.test.ts` - Market service tests
- `client/__tests__/components/PestUpload.test.tsx` - Upload component tests

---

## **Milestone 6: PWA Features & Accessibility Enhancement**
**Duration:** 1-2 days | **Priority:** High - User Experience

### Primary Features:
- Service worker implementation for offline functionality
- Voice integration (text-to-speech, speech-to-text)
- High contrast mode and accessibility improvements
- PWA manifest and installation prompts

### Files to Create/Modify:

**PWA Implementation:**
- `client/public/sw.js` - Service worker for offline caching
- `client/public/manifest.json` - PWA manifest configuration
- `client/src/lib/offline.ts` - Offline functionality helpers
- `client/src/hooks/useOfflineSync.ts` - Offline sync logic

**Accessibility Features:**
- `client/src/components/accessibility/VoiceButton.tsx` - TTS component
- `client/src/components/accessibility/SpeechInput.tsx` - STT component
- `client/src/components/accessibility/HighContrast.tsx` - Contrast toggle
- `client/src/hooks/useSpeech.ts` - Speech API integration
- `client/src/contexts/ThemeContext.tsx` - Theme and accessibility state
- `client/src/styles/accessibility.css` - Accessibility-specific styles

**Settings & Preferences:**
- `client/src/app/settings/page.tsx` - Settings management page
- `client/src/hooks/useLocalStorage.ts` - Browser storage management

**Testing Files:**
- `client/__tests__/hooks/useSpeech.test.ts` - Speech functionality tests
- `client/__tests__/components/VoiceButton.test.tsx` - Voice component tests

---

## **Testing Strategy & Plan**

### Testing Framework Setup:
- **Backend**: Jest + Supertest for API testing
- **Frontend**: Jest + React Testing Library + Cypress for E2E
- **Database**: In-memory PostgreSQL for testing
- **API Mocking**: MSW (Mock Service Worker)

### Test Coverage Goals:
- **Unit Tests**: 80%+ coverage for services and utilities
- **Integration Tests**: All API endpoints
- **Component Tests**: All UI components with accessibility testing
- **E2E Tests**: Critical user flows (auth, onboarding, advisory)

### Key Test Files by Category:

**Backend API Tests:**
- `server/__tests__/api/auth.test.ts`
- `server/__tests__/api/farms.test.ts`
- `server/__tests__/api/advisory.test.ts`
- `server/__tests__/api/weather.test.ts`

**Backend Service Tests:**
- `server/__tests__/services/AdvisoryEngine.test.ts`
- `server/__tests__/services/WeatherService.test.ts`
- `server/__tests__/services/AuthService.test.ts`

**Frontend Component Tests:**
- `client/__tests__/components/LoginForm.test.tsx`
- `client/__tests__/components/WeatherCard.test.tsx`
- `client/__tests__/components/ChatInterface.test.tsx`

**Frontend Hook Tests:**
- `client/__tests__/hooks/useAuth.test.ts`
- `client/__tests__/hooks/useAdvisory.test.ts`
- `client/__tests__/hooks/useSpeech.test.ts`

**End-to-End Tests:**
- `client/__tests__/e2e/auth-flow.cy.ts`
- `client/__tests__/e2e/onboarding.cy.ts`
- `client/__tests__/e2e/advisory-chat.cy.ts`

### Test Execution Instructions:
```bash
# Backend tests
cd server && npm test
cd server && npm run test:coverage

# Frontend unit tests
cd client && npm test
cd client && npm run test:coverage

# E2E tests
cd client && npm run test:e2e

# Full test suite
npm run test:all
```

---

## **Milestone Priority Recommendation**

For hackathon success, I recommend starting with:

1. **Milestone 1** (Foundation) - Essential infrastructure
2. **Milestone 2** (Onboarding) - Core user experience  
3. **Milestone 3** (Advisory Engine) - Primary value proposition
4. **Milestone 4** (Activity Tracking) - Core functionality
5. **Milestone 6** (PWA/Accessibility) - Differentiation features
6. **Milestone 5** (Mock ML) - Demo enhancement

This order ensures we have a working, valuable application early while building toward impressive demo features.
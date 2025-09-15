# Krishi Mitra - Complete Project Structure

```
krishi-mitra/
├── client/                          # Next.js Frontend (PWA)
│   ├── public/                      # Static assets and PWA configuration
│   │   ├── icons/                   # App icons for different sizes (PWA)
│   │   ├── images/                  # Static images (crop icons, UI elements)
│   │   ├── locales/                 # Internationalization files
│   │   │   ├── en/                  # English translations
│   │   │   │   ├── common.json      # Common UI strings
│   │   │   │   ├── advisory.json    # Advisory recommendation strings
│   │   │   │   └── alerts.json      # Weather/system alert strings
│   │   │   ├── hi/                  # Hindi translations
│   │   │   │   ├── common.json
│   │   │   │   ├── advisory.json
│   │   │   │   └── alerts.json
│   │   │   └── ml/                  # Malayalam translations
│   │   │       ├── common.json
│   │   │       ├── advisory.json
│   │   │       └── alerts.json
│   │   ├── manifest.json            # PWA manifest configuration
│   │   ├── sw.js                    # Service worker for offline functionality
│   │   └── favicon.ico
│   ├── src/
│   │   ├── app/                     # Next.js 14+ App Router
│   │   │   ├── globals.css          # Global styles and Tailwind imports
│   │   │   ├── layout.tsx           # Root layout with i18n provider
│   │   │   ├── page.tsx             # Home/Dashboard page
│   │   │   ├── onboarding/          # User registration flow
│   │   │   │   ├── page.tsx         # Main onboarding coordinator
│   │   │   │   ├── profile/page.tsx # Profile setup step
│   │   │   │   └── farm/page.tsx    # Farm setup step
│   │   │   ├── auth/                # Authentication pages
│   │   │   │   ├── login/page.tsx   # Phone number entry
│   │   │   │   ├── verify/page.tsx  # OTP verification
│   │   │   │   └── demo/page.tsx    # Demo mode bypass
│   │   │   ├── chat/                # Advisory chatbot interface
│   │   │   │   └── page.tsx         # Main chat interface
│   │   │   ├── activities/          # Activity logging and history
│   │   │   │   ├── page.tsx         # Activity list view
│   │   │   │   ├── new/page.tsx     # Log new activity form
│   │   │   │   └── [id]/page.tsx    # Activity detail view
│   │   │   ├── pest-detection/      # Image-based pest detection
│   │   │   │   └── page.tsx         # Camera/upload interface
│   │   │   ├── market-trends/       # Crop price visualization
│   │   │   │   └── page.tsx         # Price charts and trends
│   │   │   ├── farms/               # Farm management
│   │   │   │   ├── page.tsx         # Farm list
│   │   │   │   ├── new/page.tsx     # Add new farm
│   │   │   │   └── [id]/page.tsx    # Farm detail/edit
│   │   │   ├── settings/            # App settings
│   │   │   │   └── page.tsx         # Language, notifications, profile
│   │   │   └── api/                 # Client-side API route handlers
│   │   │       └── health/route.ts  # Health check endpoint
│   │   ├── components/              # Reusable UI components
│   │   │   ├── ui/                  # Basic UI primitives
│   │   │   │   ├── Button.tsx       # Accessible button component
│   │   │   │   ├── Input.tsx        # Form input with validation
│   │   │   │   ├── Card.tsx         # Content container component
│   │   │   │   ├── Modal.tsx        # Modal dialog component
│   │   │   │   ├── Select.tsx       # Dropdown selection component
│   │   │   │   ├── Loading.tsx      # Loading spinner component
│   │   │   │   └── Toast.tsx        # Notification toast component
│   │   │   ├── forms/               # Form-specific components
│   │   │   │   ├── LoginForm.tsx    # Phone number + OTP form
│   │   │   │   ├── ProfileForm.tsx  # User profile setup form
│   │   │   │   ├── FarmForm.tsx     # Farm details form with map
│   │   │   │   └── ActivityForm.tsx # Activity logging form
│   │   │   ├── layout/              # Layout and navigation components
│   │   │   │   ├── Header.tsx       # App header with navigation
│   │   │   │   ├── Footer.tsx       # App footer
│   │   │   │   ├── Sidebar.tsx      # Navigation sidebar (if needed)
│   │   │   │   └── BottomNav.tsx    # Mobile bottom navigation
│   │   │   ├── features/            # Feature-specific components
│   │   │   │   ├── WeatherCard.tsx  # Weather display component
│   │   │   │   ├── AlertCard.tsx    # Alert/notification display
│   │   │   │   ├── CropCycleCard.tsx # Active crop cycle display
│   │   │   │   ├── ActivityList.tsx # Activity history display
│   │   │   │   ├── ChatInterface.tsx # Chatbot conversation UI
│   │   │   │   ├── PestUpload.tsx   # Image upload for pest detection
│   │   │   │   ├── MarketChart.tsx  # Price trend visualization
│   │   │   │   └── MapPicker.tsx    # Farm location selection map
│   │   │   └── accessibility/       # Accessibility-focused components
│   │   │       ├── VoiceButton.tsx  # Text-to-speech activation
│   │   │       ├── SpeechInput.tsx  # Speech-to-text input
│   │   │       └── HighContrast.tsx # High contrast mode toggle
│   │   ├── contexts/                # React contexts for global state
│   │   │   ├── AuthContext.tsx      # User authentication state
│   │   │   ├── UserProfileContext.tsx # User profile and farms data
│   │   │   ├── LanguageContext.tsx  # i18n language selection
│   │   │   └── ThemeContext.tsx     # Theme and accessibility settings
│   │   ├── hooks/                   # Custom React hooks
│   │   │   ├── useAuth.ts           # Authentication logic hook
│   │   │   ├── useWeather.ts        # Weather data fetching hook
│   │   │   ├── useAdvisory.ts       # Advisory engine interaction hook
│   │   │   ├── useGeolocation.ts    # Device location access hook
│   │   │   ├── useSpeech.ts         # Speech synthesis/recognition hook
│   │   │   ├── useOfflineSync.ts    # Offline data synchronization hook
│   │   │   └── useLocalStorage.ts   # Browser storage management hook
│   │   ├── services/                # External API communication
│   │   │   ├── api.ts               # Axios instance with auth interceptors
│   │   │   ├── authService.ts       # Authentication API calls
│   │   │   ├── advisoryService.ts   # Advisory engine API calls
│   │   │   ├── weatherService.ts    # Weather data API calls
│   │   │   ├── farmService.ts       # Farm management API calls
│   │   │   ├── activityService.ts   # Activity logging API calls
│   │   │   ├── marketService.ts     # Market data API calls
│   │   │   └── pestService.ts       # Pest detection API calls
│   │   ├── lib/                     # Utility functions and configurations
│   │   │   ├── utils.ts             # General utility functions
│   │   │   ├── constants.ts         # App-wide constants
│   │   │   ├── validators.ts        # Form validation schemas
│   │   │   ├── formatters.ts        # Data formatting functions
│   │   │   ├── i18n.ts              # Internationalization setup
│   │   │   ├── storage.ts           # Local storage helpers
│   │   │   └── offline.ts           # PWA offline functionality
│   │   ├── styles/                  # Styling and theme configuration
│   │   │   ├── globals.css          # Global CSS styles
│   │   │   ├── components.css       # Component-specific styles
│   │   │   └── accessibility.css    # Accessibility-specific styles
│   │   └── types/                   # TypeScript type definitions
│   │       ├── api.ts               # API response type definitions
│   │       ├── user.ts              # User-related type definitions
│   │       ├── farm.ts              # Farm-related type definitions
│   │       ├── advisory.ts          # Advisory-related type definitions
│   │       └── common.ts            # Common/shared type definitions
│   ├── __tests__/                   # Frontend test files
│   │   ├── components/              # Component unit tests
│   │   ├── hooks/                   # Custom hook tests
│   │   ├── services/                # Service integration tests
│   │   └── __mocks__/               # Test mocks and fixtures
│   ├── .env.local.example           # Environment variables template
│   ├── next.config.js               # Next.js configuration
│   ├── tailwind.config.js           # Tailwind CSS configuration
│   ├── postcss.config.js            # PostCSS configuration
│   ├── jest.config.js               # Jest testing configuration
│   ├── package.json                 # Frontend dependencies
│   └── tsconfig.json                # TypeScript configuration
│
├── server/                          # Node.js/Express Backend
│   ├── src/
│   │   ├── api/                     # API routes and controllers
│   │   │   ├── routes/              # Express route definitions
│   │   │   │   ├── auth.ts          # Authentication endpoints
│   │   │   │   ├── users.ts         # User management endpoints
│   │   │   │   ├── farms.ts         # Farm management endpoints
│   │   │   │   ├── crops.ts         # Crop cycle management endpoints
│   │   │   │   ├── activities.ts    # Activity logging endpoints
│   │   │   │   ├── advisory.ts      # Advisory engine endpoints
│   │   │   │   ├── weather.ts       # Weather data endpoints
│   │   │   │   ├── market.ts        # Market trends endpoints
│   │   │   │   ├── pest.ts          # Pest detection endpoints
│   │   │   │   └── alerts.ts        # Alert management endpoints
│   │   │   ├── controllers/         # Request handling logic
│   │   │   │   ├── AuthController.ts # Authentication logic
│   │   │   │   ├── UserController.ts # User management logic
│   │   │   │   ├── FarmController.ts # Farm management logic
│   │   │   │   ├── CropController.ts # Crop cycle logic
│   │   │   │   ├── ActivityController.ts # Activity logging logic
│   │   │   │   ├── AdvisoryController.ts # Advisory engine logic
│   │   │   │   ├── WeatherController.ts # Weather data logic
│   │   │   │   ├── MarketController.ts # Market data logic
│   │   │   │   ├── PestController.ts # Pest detection logic
│   │   │   │   └── AlertController.ts # Alert management logic
│   │   │   └── validators/           # Request validation schemas
│   │   │       ├── authValidators.ts # Auth request validation
│   │   │       ├── farmValidators.ts # Farm request validation
│   │   │       ├── cropValidators.ts # Crop request validation
│   │   │       └── activityValidators.ts # Activity validation
│   │   ├── config/                  # Configuration management
│   │   │   ├── database.ts          # Database connection setup
│   │   │   ├── environment.ts       # Environment variable management
│   │   │   ├── jwt.ts               # JWT configuration
│   │   │   ├── twilio.ts            # SMS service configuration
│   │   │   └── constants.ts         # Server-wide constants
│   │   ├── middleware/              # Express middleware functions
│   │   │   ├── auth.ts              # JWT authentication middleware
│   │   │   ├── validation.ts        # Request validation middleware
│   │   │   ├── errorHandler.ts      # Global error handling middleware
│   │   │   ├── logging.ts           # Request logging middleware
│   │   │   ├── cors.ts              # CORS configuration middleware
│   │   │   └── rateLimit.ts         # API rate limiting middleware
│   │   ├── models/                  # Database models and schemas
│   │   │   ├── User.ts              # User model definition
│   │   │   ├── Farm.ts              # Farm model definition
│   │   │   ├── CropCycle.ts         # Crop cycle model definition
│   │   │   ├── Activity.ts          # Activity model definition
│   │   │   ├── AdvisoryRule.ts      # Advisory rule model definition
│   │   │   ├── Alert.ts             # Alert model definition
│   │   │   └── index.ts             # Model exports and associations
│   │   ├── services/                # Core business logic services
│   │   │   ├── AuthService.ts       # Authentication business logic
│   │   │   ├── AdvisoryEngine.ts    # Rule-based advisory logic
│   │   │   ├── WeatherService.ts    # Weather data processing
│   │   │   ├── MarketService.ts     # Market data processing (mock)
│   │   │   ├── PestService.ts       # Pest detection processing (mock)
│   │   │   ├── AlertService.ts      # Alert generation and management
│   │   │   ├── SMSService.ts        # SMS/OTP handling service
│   │   │   ├── CronService.ts       # Scheduled task management
│   │   │   └── DataSyncService.ts   # External data synchronization
│   │   ├── utils/                   # Utility functions and helpers
│   │   │   ├── logger.ts            # Logging utility configuration
│   │   │   ├── validators.ts        # Data validation helpers
│   │   │   ├── formatters.ts        # Data formatting utilities
│   │   │   ├── dateUtils.ts         # Date manipulation utilities
│   │   │   ├── geoUtils.ts          # Geographic calculation utilities
│   │   │   └── cryptoUtils.ts       # Encryption/hashing utilities
│   │   ├── database/                # Database-related files
│   │   │   ├── migrations/          # Database migration files
│   │   │   ├── seeds/               # Database seed data
│   │   │   │   ├── advisory_rules.ts # Pre-populated advisory rules
│   │   │   │   ├── crop_data.ts     # Kerala crop information
│   │   │   │   └── demo_users.ts    # Demo user accounts
│   │   │   └── schema.prisma        # Prisma schema definition
│   │   └── types/                   # TypeScript type definitions
│   │       ├── express.ts           # Express-specific type extensions
│   │       ├── database.ts          # Database model types
│   │       ├── api.ts               # API request/response types
│   │       └── services.ts          # Service layer types
│   ├── __tests__/                   # Backend test files
│   │   ├── api/                     # API endpoint tests
│   │   ├── services/                # Service layer tests
│   │   ├── models/                  # Database model tests
│   │   ├── utils/                   # Utility function tests
│   │   └── __mocks__/               # Test mocks and fixtures
│   ├── .env.example                 # Environment variables template
│   ├── .gitignore                   # Git ignore patterns
│   ├── package.json                 # Backend dependencies
│   ├── tsconfig.json                # TypeScript configuration
│   ├── jest.config.js               # Jest testing configuration
│   └── nodemon.json                 # Development server configuration
│
├── shared/                          # Shared utilities and types (if needed)
│   ├── types/                       # Shared TypeScript definitions
│   └── constants/                   # Shared constants
│
├── docs/                            # Documentation
│   ├── API.md                       # API documentation
│   ├── DEPLOYMENT.md                # Deployment instructions
│   ├── DEVELOPMENT.md               # Development setup guide
│   └── ARCHITECTURE.md              # System architecture overview
│
├── scripts/                         # Development and deployment scripts
│   ├── setup.sh                     # Initial project setup script
│   ├── seed-db.ts                   # Database seeding script
│   └── deploy.sh                    # Deployment automation script
│
├── .gitignore                       # Root-level Git ignore
├── .env.example                     # Root-level environment template
├── README.md                        # Project overview and setup
├── HARDWARE_INTEGRATION.md          # Hardware integration approach
├── TESTING.md                       # Testing strategy and instructions
├── package.json                     # Root package.json for workspace
└── docker-compose.yml               # Local development environment
```

## Key Architectural Decisions:

### 1. **Separation of Concerns**
- **Frontend**: Pure presentation layer with PWA capabilities
- **Backend**: Business logic, data persistence, external integrations
- **Clear API Contract**: RESTful API with consistent JSON responses

### 2. **Scalable Module Organization**
- **Feature-based folder structure** for easy navigation and maintenance
- **Shared components and utilities** to promote DRY principles
- **Type-safe API contracts** using TypeScript across the stack

### 3. **Accessibility-First Architecture**
- **Dedicated accessibility components** folder for voice, contrast, and usability features
- **i18n-first design** with separate translation files per feature
- **Progressive enhancement** approach for voice features

### 4. **Kerala-Specific Optimizations**
- **Kerala crop data seeds** with local varieties and growing cycles
- **Malayalam translation structure** with agricultural terminology
- **Geographic utilities** optimized for Kerala coordinates and districts

### 5. **Hackathon-Ready Development**
- **Mock services** clearly separated for rapid development
- **Demo mode** authentication for easy demonstration
- **Comprehensive test structure** for reliable deployment
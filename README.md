# 🌾 Krishi Sakhi

> AI-powered agricultural companion empowering farmers with real-time insights, multilingual support, and offline-first accessibility.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)

**🌐 [Live Demo](https://krishi-sakhi-nu.vercel.app/)** • **📖 [Documentation](#)** • **🐛 [Report Bug](#)** • **✨ [Request Feature](#)**

---

## ✨ Features

- **🤖 AI-Powered Advisory** - Intelligent crop recommendations and pest detection using advanced LLMs
- **🌐 Offline-First PWA** - Full functionality without internet connectivity
- **🗣️ Multilingual Support** - Available in English, Hindi, Malayalam, and Punjabi
- **📊 Real-Time Weather** - Hyperlocal forecasts and agricultural advisories
- **📱 Mobile-Optimized** - Installable progressive web app for seamless mobile experience
- **🔒 Secure Authentication** - OTP-based login with JWT token management
- **📈 Admin Analytics** - Comprehensive dashboards for agricultural insights

---

## 🏗️ Architecture

### Tech Stack

**Frontend**
- Next.js 14 (App Router) + React 18
- Tailwind CSS for styling
- Zustand for state management
- next-pwa for offline capabilities
- next-i18next for internationalization

**Backend**
- Node.js + Express 4
- Prisma ORM + PostgreSQL
- JWT authentication
- Pino logging, Helmet security, CORS protection

**Integrations**
- Open-Meteo API (weather data)
- Google Gemini AI (chat & pest detection)
- Twilio (SMS/OTP - optional)
- data.gov.in (location data - optional)

---

## 📸 Screenshots

<table>
  <tr>
    <td><img src="Assets/Landing_page-light.png" alt="Landing Light"/><br/><sub>Landing - Light Theme</sub></td>
    <td><img src="Assets/Landing_page_dark.png" alt="Landing Dark"/><br/><sub>Landing - Dark Theme</sub></td>
  </tr>
  <tr>
    <td><img src="Assets/login_page.png" alt="Login"/><br/><sub>User Authentication</sub></td>
    <td><img src="Assets/Admin_Dashboard.png" alt="Dashboard"/><br/><sub>Admin Dashboard</sub></td>
  </tr>
  <tr>
    <td><img src="Assets/Admin_schemes.png" alt="Schemes"/><br/><sub>Scheme Management</sub></td>
    <td><img src="Assets/Geo_analytics.png" alt="Analytics"/><br/><sub>Geographic Analytics</sub></td>
  </tr>
</table>

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** ≥ 18.17
- **Docker** (for PostgreSQL)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/krishi-sakhi.git
cd krishi-sakhi

# Install dependencies
cd server && npm install
cd ../client && npm install
```

### Database Setup

```bash
# Start PostgreSQL
docker compose up -d postgres

# Generate Prisma client
cd server
npm run prisma:generate
npm run prisma:migrate
```

### Configuration

Create `server/.env` from `server/.env.example`:

```env
NODE_ENV=development
PORT=4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/krishi_mitra?schema=public
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=7d
DEMO_MODE=true

# Optional: AI Features
GEMINI_API_KEY=your-gemini-api-key
GEN_AI_PROVIDER=gemini

# Optional: SMS
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### Development

```bash
# Terminal 1 - Backend (http://localhost:4000)
cd server
npm run dev

# Terminal 2 - Frontend (http://localhost:3000)
cd client
npm run dev
```

---

## 📂 Project Structure

```
krishi-sakhi/
├── client/                      # Next.js PWA Frontend
│   ├── public/                  # Static assets, icons, locales
│   ├── src/
│   │   ├── app/                 # App Router pages
│   │   ├── components/          # Reusable UI components
│   │   ├── services/            # API client services
│   │   └── lib/                 # Utilities (i18n, TTS, theme)
│   └── next.config.js           # Next.js configuration
│
├── server/                      # Express API Backend
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/          # API route definitions
│   │   │   └── controllers/     # Request handlers
│   │   ├── services/            # Business logic layer
│   │   ├── middleware/          # Auth, rate limiting
│   │   ├── database/            # Prisma schema & migrations
│   │   └── config/              # Environment & configs
│   └── prisma/                  # Database schema
│
└── docker-compose.yml           # Local development services
```

---

## 🔌 API Reference

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/otp` - Request OTP
- `POST /api/auth/login` - Login with OTP
- `POST /api/auth/login/password` - Password login

### Core Features
- `GET /api/weather` - Weather forecasts
- `POST /api/predict` - AI pest detection
- `POST /api/chat` - AI agricultural advisor
- `GET /api/market` - Market trends

### Farm Management
- `GET /api/farms` - List user farms
- `POST /api/farms` - Create new farm
- `PUT /api/farms/:id` - Update farm
- `DELETE /api/farms/:id` - Delete farm

### Admin
- `POST /api/admin/login` - Admin authentication
- `GET /api/admin/analytics` - Analytics dashboard
- `GET /api/admin/geo-analytics` - Geographic insights
- `POST /api/admin/broadcast` - Broadcast messages

---

## 🔒 Security Features

- **Helmet.js** - HTTP security headers with CSP
- **CORS Protection** - Configurable origin whitelist
- **Rate Limiting** - Request throttling per endpoint
- **JWT Authentication** - Secure token-based auth
- **Input Validation** - Zod schema validation
- **Structured Logging** - Pino for security audits

---

## 🌐 Internationalization

Supported languages:
- 🇮🇳 English (en)
- 🇮🇳 Hindi (hi)
- 🇮🇳 Malayalam (ml)
- 🇮🇳 Punjabi (pa)

Translations are located in `client/public/locales/`.

---

## 📱 PWA Capabilities

- **Offline Support** - Service worker caching
- **Installable** - Add to home screen
- **Push Notifications** - Real-time alerts
- **Background Sync** - Queue offline actions
- **Data Saver Mode** - Bandwidth optimization

---

## 🧪 Testing

```bash
# Backend tests
cd server
npm test                    # Run all tests
npm run test:watch          # Watch mode
npm run test:coverage       # Coverage report

# Frontend tests
cd client
npm test                    # Run all tests
npm run test:watch          # Watch mode
```

---

## 🚢 Deployment

### Backend

```bash
cd server
npm run build
NODE_ENV=production PORT=4000 node dist/index.js
```

### Frontend

```bash
cd client
npm run build
npm start
```

### Environment Variables

**Production Checklist:**
- ✅ Set strong `JWT_SECRET`
- ✅ Configure `DATABASE_URL` for production DB
- ✅ Set `CORS_ORIGIN` to your domain
- ✅ Add `GEMINI_API_KEY` for AI features
- ✅ Configure `TWILIO_*` for SMS (optional)
- ✅ Set `NODE_ENV=production`

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Open-Meteo for weather data API
- Google Gemini for AI capabilities
- The farming community for valuable feedback

---

## 📞 Support

- **Documentation**: [docs.krishi-sakhi.com](https://docs.krishi-sakhi.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/krishi-sakhi/issues)
- **Email**: support@krishi-sakhi.com

---

<p align="center">Made with ❤️ for farmers</p>
<p align="center">
  <a href="https://krishi-sakhi-nu.vercel.app">Website</a>
</p>

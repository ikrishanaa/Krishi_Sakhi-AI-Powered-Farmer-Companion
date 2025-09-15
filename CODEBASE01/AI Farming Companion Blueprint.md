

# **Technical Blueprint: Krishi Mitra / Krishi Sakhi AI-Powered Personal Crop Companion**

## **Section 1: Core Project Definition & Guiding Principles**

This document specifies the complete technical blueprint for "Krishi Mitra / Krishi Sakhi," an AI-powered personal crop companion designed for small and marginal farmers in India. It is intended to serve as a definitive guide for an advanced AI development agent, detailing the project's vision, user context, architectural principles, system design, feature specifications, and scalability roadmap.

### **1.1. Project Vision: "Krishi Mitra / Krishi Sakhi"**

The core vision of "Krishi Mitra / Krishi Sakhi" is to create a lightweight, highly accessible, and immediately useful digital farming companion. The application's purpose is not to automate farming but to empower farmers by augmenting their decision-making capabilities. It achieves this by providing personalized, timely, and easily understandable information tailored to their specific farm and crop cycle. The name "Krishi Mitra / Sakhi," meaning "Agricultural Friend/Companion," is a foundational design tenet. It underscores the application's role as a trusted advisor, fostering a relationship of support and reliability with the farmer throughout their agricultural journey. The system is designed to reduce uncertainty and cognitive load, translating complex agricultural data into simple, actionable guidance.

### **1.2. Target User Profile & Core Challenges**

The design and architecture of this system are fundamentally shaped by the specific context of its primary user: the small and marginal farmer in India. This user demographic faces a unique and complex set of interconnected challenges that the application must directly address.

#### **1.2.1. User Profile**

The primary user operates a small landholding, often less than 1.2 hectares, a result of fragmented land ownership over generations.1 This limited scale prevents economies of scale and makes the adoption of modern, expensive machinery unfeasible.1 Access to capital is severely restricted, forcing reliance on informal lenders and limiting investment in high-quality inputs like seeds and modern tools.2 Digital literacy levels vary significantly, presenting a major barrier to the adoption of complex technological solutions. Furthermore, linguistic diversity across India necessitates a multilingual approach to ensure inclusivity and comprehension.4

#### **1.2.2. Core Challenges Addressed**

The application is engineered to mitigate the following critical challenges:

* **Decision Paralysis and Information Asymmetry:** Farmers are confronted with a multitude of decisions regarding crop selection, fertilizer application, and pest control. Lacking access to unbiased, scientific information, they often depend on guesswork or advice from input shopkeepers, which may be commercially motivated. This creates a significant information gap between established agricultural science and its practical application on the ground.5 The application aims to bridge this gap by providing data-driven, contextual recommendations.  
* **Environmental and Financial Volatility:** The user's livelihood is exceptionally vulnerable to external shocks. Unpredictable weather patterns, including erratic monsoons and extreme temperatures, threaten entire crop cycles.3 Declining soil health from years of intensive farming and pest and disease infestations can devastate yields.3 Compounding these issues are unstable market prices and high input costs, which squeeze already tight profit margins and trap farmers in cycles of debt.1  
* **Poor Record-Keeping and Limited Learning:** The lack of systematic record-keeping prevents farmers from learning from past seasons. Without a structured history of activities, inputs, and outcomes, it is difficult to identify patterns, optimize practices, or make informed decisions for future crop cycles. This limits the potential for iterative improvement and adaptation.  
* **Digital and Linguistic Barriers:** Existing agri-tech solutions often fail to account for low digital literacy and the vast linguistic diversity of rural India. Interfaces that are text-heavy, use technical jargon, or are available only in English or a few major languages exclude a large portion of the target user base.

### **1.3. Guiding Architectural Principles**

To effectively address the project's objectives within a hackathon context while ensuring long-term viability, the following architectural principles are non-negotiable:

* **Hackathon-Ready & Lightweight:** The architecture must be optimized for rapid, iterative development. This mandates the strategic use of mock data and services to decouple development from complex external dependencies that are slow to integrate, such as government data portals or APIs requiring extensive setup.8 The solution must be "lightweight," meaning it operates without requiring any on-farm hardware like IoT sensors, relying instead on farmer-provided inputs and publicly accessible APIs.  
* **User-Centric & Accessibility-First:** The User Interface (UI) and User Experience (UX) are not secondary considerations; they are the core of the solution's effectiveness. Every design and architectural decision must be evaluated against the needs of a user with low digital literacy. The system's intelligence is measured not by the complexity of its models, but by the simplicity and clarity of its output. It must function as a "trust and translation engine," synthesizing complex inputs (farmer profile, weather data, agronomic rules) into a single, simple, actionable instruction. This approach builds trust and ensures comprehension, which are paramount for user adoption.  
* **Scalable & Modular:** The prototype must be constructed on a solid foundation that supports future evolution. The architecture must be modular, allowing for individual components (e.g., the market data service, the pest detection model) to be replaced or upgraded without necessitating a complete system overhaul. This ensures that the hackathon prototype is not a dead-end but the first version of a production-ready application.

### **1.4. Core UI/UX Mandates for Low Digital Literacy**

The application's interface must adhere to a strict set of design mandates derived from established best practices for users with low digital literacy.4 These rules are critical for ensuring the application is intuitive, welcoming, and empowering rather than intimidating.

* **Simplicity and Minimalism:** The interface must be clean and uncluttered to minimize cognitive overload.10 A "one-button-for-one-task" philosophy should be adopted wherever feasible.12 Navigation must be shallow, limited to a maximum of two or three layers, with key actions placed prominently on the main screen to avoid being hidden in complex menus.11  
* **Clear & Simple Language:** All text must be in plain, jargon-free, conversational language. Technical terms like "authenticate" or "sync" must be replaced with simpler, more descriptive phrases like "enter the code we sent" or "save your work".11 All user-facing text must be managed through a translation system to support multiple regional languages.  
* **Visual Cues & Iconography:** Visuals are a powerful tool for communication. Every icon must be paired with a clear, descriptive text label to avoid ambiguity.11 The design must use large, legible fonts with high color contrast between text and background to accommodate users with potential vision impairments.10 Buttons and other touch targets must be large and well-spaced to be easily tappable, especially for users who may have motor challenges.10 Visual cues, such as highlighting an abnormal soil reading in red, can effectively draw the user's attention to critical information.4  
* **Guided Assistance & Error Prevention:** The application must actively guide the user. This includes an initial onboarding process that introduces core features through simple, step-by-step tutorials.10 Error messages must be friendly, clear, and actionable. Instead of a generic "An error occurred," the system should provide specific guidance, such as "Oops\! It looks like you missed your phone number. Please enter it here".11  
* **Voice & Audio Integration:** To overcome literacy and typing barriers, the application must incorporate optional voice features. Text-to-speech capabilities, allowing advisories to be read aloud, and speech-to-text for user input are essential for accessibility.12

## **Section 2: System Architecture & Technology Stack**

This section defines the high-level technical architecture and the specific technologies chosen to build the application. These choices are justified based on the guiding principles of rapid development, scalability, and user experience.

### **2.1. High-Level System Architecture**

The system will be implemented using a **Monolithic Backend with a Decoupled Frontend** architecture, designed as a Progressive Web App (PWA).

* **Architectural Model:**  
  * **Frontend:** A client-side application responsible for all user interface rendering and interaction. It will be developed as a PWA to provide a native app-like experience, including offline capabilities and home screen installation on mobile devices.  
  * **Backend:** A single, monolithic service that exposes a RESTful API. This backend will handle all business logic, data processing, database interactions, and communication with external services.  
  * **Communication:** The frontend and backend will communicate exclusively through a well-defined REST API using JSON as the data interchange format.  
* **Justification:**  
  * **Rapid Development:** A monolithic architecture is significantly faster to develop, test, and deploy compared to a microservices architecture. It eliminates the complexities of inter-service communication, service discovery, and distributed data management, making it the optimal choice for a time-constrained hackathon environment.  
  * **Logical Cohesion:** The core functionality of the advisory engine requires tight integration between user profiles, farm data, crop cycle information, and external data sources like weather APIs. A monolithic approach keeps this related logic in a single codebase, simplifying development and reducing latency.  
  * **Decoupled Frontend for PWA:** Separating the frontend from the backend is crucial for creating a modern, responsive user experience. This decoupling allows the frontend to be developed as a PWA, which is essential for serving users in areas with poor or intermittent internet connectivity. The PWA can cache data and application shells, enabling core functionalities to work offline.

### **2.2. Proposed Technology Stack**

The technology stack is selected to maximize developer velocity, leverage a unified language (JavaScript/TypeScript), and ensure a robust, scalable foundation.

* **Frontend:**  
  * **Framework: Next.js (React)**  
  * **Justification:** Next.js provides a powerful and comprehensive framework for building modern web applications. Its built-in support for server-side rendering (SSR) and static site generation (SSG) ensures high performance and fast initial load times. It has excellent tooling for creating PWAs and a rich ecosystem of component libraries (e.g., Material-UI, Chakra UI) that offer accessible, pre-built components, accelerating UI development. Its internationalization (i18n) routing and support are critical for the multilingual requirement.  
* **Backend:**  
  * **Runtime & Framework: Node.js with Express.js**  
  * **Justification:** Node.js is highly efficient for I/O-bound applications, such as a backend that primarily handles API requests and database queries. Its non-blocking architecture ensures scalability. Using Express.js provides a minimalist yet powerful framework for building the REST API. The use of JavaScript/TypeScript across the entire stack (frontend and backend) streamlines development, allowing developers to work on both parts of the application without context switching between languages.  
* **Database:**  
  * **System: PostgreSQL**  
  * **Justification:** PostgreSQL is a robust, open-source, and highly reliable relational database. It offers strong support for standard SQL while also providing advanced features like the JSONB data type. JSONB is particularly useful for storing semi-structured or flexible data, such as the conditions within advisory rules or detailed logs of farming activities, without sacrificing the benefits of a structured relational model.  
* **Authentication:**  
  * **Method: JWT (JSON Web Tokens) with Phone Number \+ OTP Verification**  
  * **Justification:** Phone number-based authentication is the most accessible method for the target user base in India, as it does not require users to create or remember email addresses and complex passwords. One-Time Passwords (OTPs) sent via SMS provide a secure and familiar verification mechanism. JWT is the industry standard for managing stateless authentication in decoupled architectures, allowing the frontend to securely communicate with the backend API after the initial login.  
* **Deployment:**  
  * **Platform: Vercel (Frontend) and Heroku (Backend/Database)**  
  * **Justification:** Both Vercel and Heroku are chosen for their exceptional developer experience, seamless Git-based CI/CD pipelines, and generous free tiers, which are ideal for a hackathon project. Vercel is optimized for deploying Next.js applications, while Heroku provides a simple and scalable platform for hosting the Node.js backend and a managed PostgreSQL database. This combination allows for rapid, automated deployments with minimal configuration.

### **2.3. Directory & File Structure Specification**

A clean, modular, and scalable project structure is essential for maintainability and team collaboration. The following directory structure will be implemented.  
Here’s a Tree structure (you can modify if you need to as per you solution)

Code snippet

krishi-mitra/  
├── client/                     \# Next.js Frontend (PWA)  
│   ├── public/                 \# Static assets: images, icons, manifest.json for PWA  
│   ├── src/  
│   │   ├── app/                \# Next.js 13+ App Router for page-based routing  
│   │   ├── components/         \# Reusable, atomic UI components (e.g., Button, Card, InputField)  
│   │   ├── contexts/           \# Global state management (e.g., AuthContext, UserProfileContext)  
│   │   ├── hooks/              \# Custom React hooks for reusable logic (e.g., useWeather)  
│   │   ├── services/           \# API client for backend communication (e.g., axios instance)  
│   │   ├── styles/             \# Global CSS, theme configurations  
│   │   └── lib/                \# Utility functions, i18n configuration, constants  
│   ├── next.config.js          \# Next.js configuration file  
│   └── package.json  
├── server/                     \# Node.js/Express Backend  
│   ├── src/  
│   │   ├── api/                \# API routes and controllers, organized by feature  
│   │   ├── config/             \# Environment variable management, database connection setup  
│   │   ├── middleware/         \# Request processing middleware (e.g., authentication, error handling)  
│   │   ├── models/             \# Database schemas/models (e.g., using Prisma or Sequelize ORM)  
│   │   ├── services/           \# Core business logic (e.g., AdvisoryEngine, WeatherService)  
│   │   └── utils/              \# Helper functions, formatters, etc.  
│   ├──.env.example            \# Template for environment variables  
│   └── package.json  
└── README.md                   \# Project overview and setup instructions

## **Section 3: Data Models & API Specifications**

This section defines the application's data architecture, including the database schema and the contracts for both internal and external APIs. A well-defined data model is the backbone of the application, ensuring data integrity and enabling complex features.

### **3.1. Database Schema**

The PostgreSQL database will be structured with the following tables to logically store and relate all application data.

* **Users**  
  * Stores information about each registered farmer.  
  * id: SERIAL PRIMARY KEY  
  * phone\_number: VARCHAR(15) UNIQUE NOT NULL  
  * name: VARCHAR(255)  
  * language\_preference: VARCHAR(10) DEFAULT 'en' (e.g., 'en', 'hi', 'mr')  
  * created\_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP  
* **Farms**  
  * Stores details for each farm owned by a user. A user can have multiple farms.  
  * id: SERIAL PRIMARY KEY  
  * user\_id: INTEGER REFERENCES Users(id) ON DELETE CASCADE  
  * farm\_name: VARCHAR(255)  
  * location\_lat: DECIMAL(9, 6\) NOT NULL  
  * location\_lon: DECIMAL(9, 6\) NOT NULL  
  * soil\_type: VARCHAR(50) (e.g., 'sandy', 'clayey', 'loamy')  
  * irrigation\_source: VARCHAR(50) (e.g., 'rain-fed', 'canal', 'borewell')  
* **CropCycles**  
  * This is the central entity for tracking a specific crop from sowing to harvest. It serves as a container for all related activities and advisories for one season. This structure directly addresses the core user problem of poor record-keeping, creating a chronological, organized log for each farming endeavor.2 By linking all activities to a specific cycle, the system enables future analysis, such as comparing the performance of different seasons or practices.  
  * id: SERIAL PRIMARY KEY  
  * farm\_id: INTEGER REFERENCES Farms(id) ON DELETE CASCADE  
  * crop\_name: VARCHAR(100) NOT NULL  
  * sowing\_date: DATE NOT NULL  
  * expected\_harvest\_date: DATE  
  * status: VARCHAR(20) DEFAULT 'active' (e.g., 'active', 'completed', 'failed')  
  * created\_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP  
* **Activities**  
  * Logs every significant action taken by the farmer during a crop cycle.  
  * id: SERIAL PRIMARY KEY  
  * crop\_cycle\_id: INTEGER REFERENCES CropCycles(id) ON DELETE CASCADE  
  * activity\_type: VARCHAR(50) NOT NULL (e.g., 'sowing', 'irrigation', 'fertilizer', 'pest\_control')  
  * date: DATE NOT NULL  
  * notes: TEXT  
  * data: JSONB (Stores specific details, e.g., {"fertilizer\_name": "Urea", "quantity": "10kg"})  
* **AdvisoryRules**  
  * The knowledge base for the rule-based advisory engine.  
  * id: SERIAL PRIMARY KEY  
  * crop\_name: VARCHAR(100) (Can be 'Any' for generic rules)  
  * trigger\_event: VARCHAR(50) NOT NULL (e.g., 'weather', 'fertilizer\_query', 'pest\_symptom')  
  * conditions: JSONB NOT NULL (Stores the 'IF' part of the rule, e.g., {"days\_since\_sowing": {"gt": 20}, "soil\_type": "sandy"})  
  * recommendation\_key: VARCHAR(255) NOT NULL (A language-agnostic key for the advice)  
  * priority: INTEGER DEFAULT 0  
* **Alerts**  
  * Stores personalized alerts and reminders for each user.  
  * id: SERIAL PRIMARY KEY  
  * user\_id: INTEGER REFERENCES Users(id) ON DELETE CASCADE  
  * alert\_type: VARCHAR(50) NOT NULL (e.g., 'weather', 'activity\_reminder')  
  * content\_key: VARCHAR(255) NOT NULL (Language-agnostic key for the alert message)  
  * is\_read: BOOLEAN DEFAULT FALSE  
  * created\_at: TIMESTAMP WITH TIME ZONE DEFAULT CURRENT\_TIMESTAMP

### **3.2. Internal API Endpoints (RESTful API Contract)**

The backend will expose a RESTful API with the following key endpoints. All endpoints, except for authentication, will be protected and require a valid JWT in the Authorization header.

* **Authentication**  
  * POST /api/auth/otp: Accepts { phoneNumber }. Generates and sends an OTP.  
  * POST /api/auth/login: Accepts { phoneNumber, otp }. Verifies OTP and returns a JWT.  
* **User & Farm Management**  
  * GET /api/users/me: Retrieves the profile of the currently authenticated user.  
  * GET /api/users/me/farms: Lists all farms for the current user.  
  * POST /api/users/me/farms: Creates a new farm for the user.  
* **Crop Cycle & Activity Management**  
  * GET /api/farms/{farmId}/cycles: Lists all crop cycles for a specific farm.  
  * POST /api/farms/{farmId}/cycles: Creates a new crop cycle.  
  * GET /api/cycles/{cycleId}: Retrieves details of a specific crop cycle.  
  * GET /api/cycles/{cycleId}/activities: Lists all activities for a specific crop cycle.  
  * POST /api/cycles/{cycleId}/activities: Logs a new activity for a crop cycle.  
* **Advisory & Intelligence**  
  * POST /api/chat/query: The main endpoint for the advisory engine. Accepts a structured query like { cycleId, queryType, params } and returns a recommendation.  
  * GET /api/alerts: Fetches all unread alerts for the authenticated user.  
  * POST /api/predict/pest: (Mock) Accepts an image upload and returns a mock pest/disease prediction.  
  * GET /api/market-trends: (Mock) Accepts { crop, district } and returns mock market price data.

### **3.3. External API Integration Contracts**

The system will integrate with external services via dedicated backend adapters to isolate the core application from external dependencies and simplify data structures.

* **Weather API**  
  * **Provider:** **OpenWeatherMap One Call API 3.0**.14  
  * **Justification:** The India Meteorological Department (IMD) API, while highly localized, requires an IP whitelisting process that is prohibitive for a hackathon's rapid development cycle.8 OpenWeatherMap provides a globally accessible API with a simple API key authentication method and a generous free tier that supplies all necessary data for the prototype, including daily forecasts, precipitation probability, and temperature.  
  * **Backend Adapter (WeatherService):** A dedicated service in the backend will be responsible for all interactions with the OpenWeatherMap API. This service will act as an adapter, making a request with the farm's latitude and longitude and then transforming the complex, deeply nested JSON response from OpenWeatherMap into a simple, standardized internal format. For example: { "date": "2025-10-27", "forecast\_condition": "Rain", "precipitation\_probability": 0.8, "temp\_max": 31, "temp\_min": 24 }. This abstraction ensures that if the weather provider is changed in the future, only this service needs to be updated, with no changes required in the rest of the application.  
* **Market Data API (Mock)**  
  * **Specification:** For the hackathon, a mock API will be implemented within the backend. It will expose the endpoint GET /api/market-trends?crop=brinjal\&district=pune.  
  * **Justification:** Real-world agricultural market data APIs, such as those from AGMARKNET, can be complex, have inconsistent data formats, or be unreliable.9 Creating a mock endpoint that returns a static, hardcoded JSON array (e.g.,  
    \[{ "date": "2025-10-26", "price": 1500 }, { "date": "2025-10-27", "price": 1550 }\]) allows the frontend development of the market trends visualization to proceed independently and rapidly without being blocked by data acquisition challenges. This is a critical strategy for ensuring the feature can be demonstrated successfully within the hackathon timeframe.

## **Section 4: Feature Module Specifications**

This section provides a detailed functional specification for each core module of the application, outlining the user flow, underlying logic, and specific UI/UX considerations.

### **4.1. Module: Farmer & Farm Profiling (Onboarding)**

* **Objective:** To seamlessly onboard a new user and capture the essential information required for personalized advisories.  
* **User Flow:**  
  1. **Login:** The user enters their 10-digit mobile number.  
  2. **OTP Verification:** The user receives an SMS with an OTP and enters it into the app to log in.  
  3. **Profile Setup:** On first login, the app prompts for the user's name and preferred language from a list of available options (e.g., English, हिंदी, मराठी).  
  4. **Add First Farm:** The user is guided through a multi-step process to add their first farm. Each piece of information is requested on a separate, simple screen to avoid overwhelming them.10  
     * Screen 1: "What is the name of your farm?" (e.g., "Home Field").  
     * Screen 2: "Where is your farm?" A map interface is shown, and the user can tap to place a pin or use the device's GPS for their current location.  
     * Screen 3: "What is the soil type?" The user selects from a list with clear icons and simple labels: Sandy, Clayey, Loamy.  
     * Screen 4: "What is your main source of water?" The user selects from a list with icons: Rain-fed, Canal, Borewell, Pond.  
* **UI Guidance:** The entire onboarding process will use large, easily tappable buttons, high-contrast text, and visual icons to aid comprehension. Progress indicators will show the user how many steps are left.

### **4.2. Module: Smart Chatbot & Advisory Logic Engine**

* **Objective:** To provide farmers with simple, contextual, and actionable advice through a guided conversational interface.  
* **Chatbot Architecture:** This module will not be a free-form, LLM-based chatbot. It will be a **structured, rule-based conversational interface**. The user will be presented with a menu of common questions or tasks (e.g., "Fertilizer Advice," "Pest Problem," "Weather Forecast") represented by large buttons. This guided approach eliminates the need for the user to type complex queries and ensures the system receives structured input.  
* **Advisory Logic Engine:** The core of this module is a rule-based expert system implemented in the backend's AdvisoryEngine service.17 This engine uses the  
  AdvisoryRules table as its knowledge base to mimic the decision-making process of an agricultural expert.6  
  * **Example Rule Flow:**  
    1. A farmer with an active "Brinjal" CropCycle taps the "Fertilizer Advice" button on the app's home screen.  
    2. The frontend sends a structured request to the POST /api/chat/query endpoint with a payload like { "cycleId": 123, "queryType": "fertilizer\_advice" }.  
    3. The backend AdvisoryEngine receives the request and retrieves all relevant context: the CropCycle details (e.g., crop\_name: 'brinjal', days\_since\_sowing: 25), the associated Farm profile (e.g., soil\_type: 'sandy'), and the latest weather forecast from the WeatherService (e.g., next\_24h\_rain: false).  
    4. The engine queries the AdvisoryRules table to find a rule that matches this context. It finds a rule where crop\_name \= 'brinjal' and the conditions JSON matches the current state (e.g., {"days\_since\_sowing": {"gt": 20, "lt": 30}, "soil\_type": "sandy"}).  
    5. The engine retrieves the recommendation\_key from the matching rule (e.g., BRINJAL\_FERT\_1\_SANDY).  
    6. The backend returns this key to the frontend. The frontend then uses this key to look up the corresponding translated, user-friendly advice in its language files and displays it to the user.  
* **Knowledge Base Source:** The initial set of rules for the hackathon will be based on established agricultural best practices for common Indian crops like brinjal and tomato, drawing from public agricultural advisories and research.7

#### **Table 1: Sample Rule-Based Advisory Knowledge Base (for Brinjal)**

| RuleID | Crop | Stage (Days) | Trigger | Condition (JSON) | Recommendation\_Key |
| :---- | :---- | :---- | :---- | :---- | :---- |
| FERT-BR-01 | Brinjal | 15-30 | Fertilizer | {"soil\_type": "sandy", "irrigation": "borewell"} | BRINJAL\_FERT\_1\_SANDY |
| FERT-BR-02 | Brinjal | 15-30 | Fertilizer | {"soil\_type": "loamy"} | BRINJAL\_FERT\_1\_LOAMY |
| PEST-BR-01 | Brinjal | 30-60 | Pest | {"symptom": "holes\_in\_fruit"} | BRINJAL\_PEST\_FRUIT\_BORER |
| PEST-BR-02 | Brinjal | 30-60 | Pest | {"symptom": "yellow\_leaves", "visual": "whiteflies"} | BRINJAL\_PEST\_WHITEFLY |
| WTHR-GEN-01 | Any | Any | Weather | {"forecast": "heavy\_rain", "next\_hours": 24} | WEATHER\_ALERT\_HEAVY\_RAIN |
| WTHR-GEN-02 | Any | Any | Weather | {"forecast": "heatwave", "temp\_c": { "gt": 40 }} | WEATHER\_ALERT\_HEATWAVE |

### **4.3. Module: Weather Integration & Alert System**

* **Objective:** To proactively provide farmers with simple, actionable alerts based on weather forecasts.  
* **Logic:** A scheduled task (cron job) will run on the backend once every 24 hours. For each registered farm, this job will:  
  1. Retrieve the farm's latitude and longitude.  
  2. Call the internal WeatherService to get the 7-day forecast from OpenWeatherMap.  
  3. Process the forecast data through a set of simple rules.  
* **Alert Generation Rules:**  
  * IF tomorrow's precipitation\_probability \> 60% THEN create a new entry in the Alerts table with user\_id and content\_key 'HEAVY\_RAIN\_EXPECTED\_AVOID\_IRRIGATION'.  
  * IF max\_temperature \> 40°C for the next 3 consecutive days THEN create an alert with content\_key 'HEATWAVE\_WARNING\_ENSURE\_IRRIGATION'.  
  * IF wind\_speed \> 25 km/h is forecasted for tomorrow THEN create an alert with content\_key 'HIGH\_WINDS\_AVOID\_SPRAYING'.  
* **UI:** Alerts will be displayed prominently on the app's home screen using a simple card format. Each card will feature a large icon (e.g., a rain cloud, a sun), the alert text in the user's preferred language, and the time it was issued.

### **4.4. Module: Pest & Disease Advisory (Mock ML Model)**

* **Objective:** To demonstrate the end-to-end user flow of image-based disease detection for the hackathon prototype without the complexity of deploying a live ML model.  
* **Dataset for Demonstration:** A small, curated subset of an open-source dataset, such as the "Eggplant Leaf Disease Detection Dataset," will be used to showcase the concept.23 The demonstration will focus on three visually distinct classes:  
  Healthy, Leaf Spot Disease, and Insect Pest Disease.  
* **Model (Conceptual):** A lightweight Convolutional Neural Network (CNN), like a fine-tuned MobileNetV2, would be the appropriate model for this task due to its efficiency on mobile devices. However, this model will be trained offline and will *not* be deployed as part of the hackathon.  
* **Mock API Implementation:** The backend will feature the endpoint POST /api/predict/pest. This endpoint will be a mock service. It will accept an image file upload to simulate the real process, but instead of running inference, it will:  
  1. Introduce an artificial delay of 2-3 seconds to mimic processing time.  
  2. Return a randomized but valid JSON response from a predefined set of possible outcomes. Example response: { "prediction": "Leaf Spot Disease", "confidence": 0.85, "recommendation\_key": "LEAF\_SPOT\_TREATMENT" }.  
  * This approach is critical for hackathon feasibility. It allows the frontend and backend to be fully built and integrated for a compelling demonstration, completely decoupling the project from the time-consuming and resource-intensive tasks of ML model training, optimization, and deployment.

### **4.5. Module: Activity Tracking & Reminders**

* **Objective:** To provide a simple tool for farmers to log their activities, creating a digital farm diary that can be used for future reference.  
* **UI:** A primary action button on the home screen will open a simple form for logging a new activity. The form will feature large, icon-based buttons for selecting the activity type (e.g., a seed icon for sowing, a water droplet for irrigation). It will include a user-friendly date picker and a simple text area for optional notes.  
* **Logic:** When an activity is submitted, the data is saved to the Activities table and linked to the user's currently active CropCycle.  
* **Reminders:** To add immediate value, the system will offer to set reminders. For example, after a user logs a "Fertilizer Application," the app will display a prompt: "Set a reminder for the next application in 15 days?". If the user agrees, a new entry is created in the Alerts table with a future trigger date.

### **4.6. Module: Market Trends (Mock Data Visualization)**

* **Objective:** To demonstrate how market price information can be presented to farmers to help them make better selling decisions.  
* **UI:** The module will feature a simple line chart that visualizes the price trend of a selected crop over the past 30 days. The user will be able to select their crop from a dropdown menu.  
* **Data Source:** The chart will be populated by data fetched from the mock backend endpoint GET /api/market-trends. This endpoint will return a static, predictable JSON dataset, ensuring that the UI can be built and tested reliably without depending on a live, external data source during the hackathon.

## **Section 5: Internationalization (i18n) & Accessibility**

This section details the implementation of features that are critical for making the application usable and accessible to the entire target user base, addressing both linguistic and literacy barriers.

### **5.1. Language Support Strategy**

* **Implementation:** Internationalization will be implemented using a standard library such as next-i18next. All user-facing strings in the frontend application will be externalized into locale-specific JSON files (e.g., public/locales/en/common.json, public/locales/hi/common.json). The backend API will communicate using language-agnostic keys (e.g., recommendation\_key: 'BRINJAL\_PEST\_FRUIT\_BORER'). The frontend will be responsible for mapping these keys to the translated strings in the user's selected language.  
* **Initial Languages:** The prototype will be developed with support for **English**, **Hindi**, and one major regional language (e.g., **Marathi**) to demonstrate the full functionality of the i18n system. The user's language preference will be stored in the Users table and can be changed at any time in the app settings.

### **5.2. Voice API Integration Specification**

To maximize accessibility for users with low literacy or who are uncomfortable with typing on a small screen, the application will integrate voice functionalities using native browser APIs, avoiding the need for external paid services.12

* **Text-to-Speech (TTS):** A small "speaker" icon will be placed next to all key advisory messages and alerts. When a user taps this icon, the frontend will use the browser's built-in window.SpeechSynthesis API to read the displayed text aloud in the selected language (if supported by the browser's voice engine).  
* **Speech-to-Text (STT):** The chatbot's text input field and other note-taking fields will include a "microphone" icon. Tapping this icon will activate the browser's window.SpeechRecognition API. This will capture the user's spoken words, transcribe them into text, and populate the input field, allowing for hands-free interaction.

### **5.3. Accessibility Compliance Checklist**

The application will be developed with adherence to the Web Content Accessibility Guidelines (WCAG) 2.1, with a focus on meeting Level AA standards. Key compliance points include:

* **Color Contrast:** All text and meaningful UI elements will have a contrast ratio of at least 4.5:1 against their background.  
* **Touch Target Size:** All interactive elements, including buttons and links, will have a minimum touch target size of 44x44 CSS pixels.  
* **Focus Indicators:** Clear and visible focus indicators will be implemented for all interactive elements to support keyboard navigation.  
* **Alternative Text:** All meaningful images and icons will have descriptive alt text to be accessible to screen readers.  
* **Semantic HTML:** The application will use proper semantic HTML5 elements (\<nav\>, \<main\>, \<button\>, etc.) to ensure a logical structure for assistive technologies.

## **Section 6: Deployment & Scalability Roadmap** **(not all is relevant to you, so mind only the ones that are)**

This section outlines the deployment strategy for the hackathon prototype and provides a clear, phased roadmap for scaling the application into a production-ready system.

### **6.1. Hackathon Deployment Plan**

The deployment strategy is designed for speed, simplicity, and cost-effectiveness, leveraging platforms with robust free tiers and automated CI/CD pipelines.

* **Frontend (Next.js):** The application will be deployed to **Vercel**. A direct integration with the project's GitHub repository will be configured, enabling continuous deployment. Every git push to the main branch will automatically trigger a new build and deployment.  
* **Backend (Node.js) & Database (PostgreSQL):** The backend API and the PostgreSQL database will be deployed on **Heroku**. The backend will be deployed as a free-tier "dyno," and the database will use the Heroku Postgres add-on, which also offers a free tier suitable for a prototype.  
* **Environment Variables:** All sensitive information, such as the OpenWeatherMap API key, database connection string, and JWT secret, will be managed through environment variables. An .env.example file will be committed to the repository, while the actual .env files will be kept private and their values configured directly in the Vercel and Heroku dashboards. This practice ensures that no secrets are hardcoded in the source code.

### **6.2. Post-Hackathon Scalability Pathways**

The hackathon prototype serves as a proof-of-concept. The following phased roadmap outlines its evolution into a robust, scalable, and impactful real-world application.

#### **Phase 2 \- Pilot (3-6 Months Post-Hackathon)**

* **Real Data Integration:**  
  * **Market Data:** Replace the mock market data API with a resilient data pipeline. This will involve developing a service to regularly ingest data from official sources like the AGMARKNET portal, clean it, and store it in the application's database for fast retrieval.9  
  * **Weather Data:** Evaluate and potentially switch to the IMD API for more accurate, hyper-local Indian weather data, having established the necessary server infrastructure with a static IP for whitelisting.8  
* **Live ML Model Deployment:**  
  * Deploy the trained pest detection model to a scalable, serverless ML inference service (e.g., AWS SageMaker Serverless Inference, Google AI Platform Prediction).  
  * Replace the mock /api/predict/pest endpoint with a live endpoint that sends the image to the deployed model and returns a real prediction.  
* **Knowledge Base Expansion:**  
  * Collaborate with agricultural universities and domain experts to significantly expand the AdvisoryRules knowledge base. This will involve adding rules for more crops, different agro-climatic zones, and a wider range of pests, diseases, and nutrient deficiencies.

#### **Phase 3 \- Production (6-12 Months Post-Hackathon)**

* **Advanced Data Integration:**  
  * Explore and integrate with other government digital initiatives, such as APIs for accessing farmers' Soil Health Card data, to further personalize fertilizer recommendations.  
* **Advanced Analytics & Predictive Models:**  
  * Leverage the rich, structured data collected in the CropCycles and Activities tables. This historical data is a valuable asset that can be used to train new ML models for:  
    * **Yield Estimation:** Predicting potential yield based on inputs and weather patterns.  
    * **Personalized Crop Planning:** Recommending optimal crops for the next season based on past performance and market trends.  
* **Infrastructure Modernization:**  
  * Migrate the application from the free-tier platforms (Vercel/Heroku) to a more robust and scalable cloud infrastructure (e.g., AWS, Google Cloud Platform, or Azure).  
  * Containerize the backend application using Docker and manage deployments with an orchestration platform like Kubernetes for high availability and automated scaling.  
  * Implement a dedicated monitoring and logging solution (e.g., Prometheus, Grafana, ELK Stack) to ensure system health and performance at scale.

#### **Works cited**

1. Indian Agriculture Challenges 2025: Top Issues & Solutions \- Farmonaut, accessed on September 14, 2025, [https://farmonaut.com/asia/indian-agriculture-challenges-2025-top-issues-solutions](https://farmonaut.com/asia/indian-agriculture-challenges-2025-top-issues-solutions)  
2. What are the most common problems and challenges that farmers face? \- Jiva, accessed on September 14, 2025, [https://www.jiva.ag/blog/what-are-the-most-common-problems-and-challenges-that-farmers-face](https://www.jiva.ag/blog/what-are-the-most-common-problems-and-challenges-that-farmers-face)  
3. Problems of Indian Agriculture: The Challenges Farmers Face Today (and Why It's No Walk in the Park) | Swasya Living, accessed on September 14, 2025, [https://www.swasyaliving.com/post/problems-of-indian-agriculture](https://www.swasyaliving.com/post/problems-of-indian-agriculture)  
4. Designing for People with Low Digital Literacy | Thoughtworks United States, accessed on September 14, 2025, [https://www.thoughtworks.com/en-us/insights/blog/designing-people-low-digital-literacy](https://www.thoughtworks.com/en-us/insights/blog/designing-people-low-digital-literacy)  
5. Agriculture Advisory Expert System by Computer Science Student | PDF \- Scribd, accessed on September 14, 2025, [https://www.scribd.com/document/800162773/Agriculture-Advisory-Expert-System-by-Computer-Science-Student](https://www.scribd.com/document/800162773/Agriculture-Advisory-Expert-System-by-Computer-Science-Student)  
6. Expert system for Decision support in Agriculture \- TNAU Agritech Portal, accessed on September 14, 2025, [https://agritech.tnau.ac.in/pdf/14.pdf](https://agritech.tnau.ac.in/pdf/14.pdf)  
7. The Major Challenges Indian Farmers Face Today and How to Address Them \- Shriram Farm Solutions, accessed on September 14, 2025, [https://shriramfarmsolutions.com/blog/the-major-challenges-indian-farmers-face-today-and-how-to-address-them/](https://shriramfarmsolutions.com/blog/the-major-challenges-indian-farmers-face-today-and-how-to-address-them/)  
8. List of API's of India Meteorological Department \- IMD, accessed on September 14, 2025, [https://mausam.imd.gov.in/imd\_latest/contents/api.pdf](https://mausam.imd.gov.in/imd_latest/contents/api.pdf)  
9. Current Daily Price of Various Commodities from Various Markets ..., accessed on September 14, 2025, [https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi](https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi)  
10. Building UI/UX For Non-Tech-Savvy Users: Designing For Digital ..., accessed on September 14, 2025, [https://lightweightsolutions.co/building-ui-ux-for-non-tech-savvy-users-designing-for-digital-literacy/](https://lightweightsolutions.co/building-ui-ux-for-non-tech-savvy-users-designing-for-digital-literacy/)  
11. Designing for Low Digital Literacy Users \- UX Bulletin, accessed on September 14, 2025, [https://www.ux-bulletin.com/designing-low-digital-literacy-users/](https://www.ux-bulletin.com/designing-low-digital-literacy-users/)  
12. What are the best practices for UX/UI design in mHealth apps? \- Quora, accessed on September 14, 2025, [https://www.quora.com/What-are-the-best-practices-for-UX-UI-design-in-mHealth-apps](https://www.quora.com/What-are-the-best-practices-for-UX-UI-design-in-mHealth-apps)  
13. Improving User Interfaces to Bridge the Digital Literacy Gap in Healthcare \- Medium, accessed on September 14, 2025, [https://medium.com/@devan\_73578/improving-user-interfaces-to-bridge-the-digital-literacy-gap-in-healthcare-180ce3f24296](https://medium.com/@devan_73578/improving-user-interfaces-to-bridge-the-digital-literacy-gap-in-healthcare-180ce3f24296)  
14. Weather API \- OpenWeatherMap, accessed on September 14, 2025, [https://openweathermap.org/api](https://openweathermap.org/api)  
15. Current weather data \- OpenWeatherMap, accessed on September 14, 2025, [https://openweathermap.org/current](https://openweathermap.org/current)  
16. Statistical and Analytical Reports \- Agriculture Marketing, accessed on September 14, 2025, [https://agmarknet.gov.in/pricetrends/](https://agmarknet.gov.in/pricetrends/)  
17. CROPES: A Rule-based Expert System For Crop Selection In India, accessed on September 14, 2025, [https://elibrary.asabe.org/abstract.asp?aid=28218](https://elibrary.asabe.org/abstract.asp?aid=28218)  
18. Expert Systems in Agriculture: A Review \- Saravanan Raj, accessed on September 14, 2025, [https://saravananraj.in/wp-content/uploads/2020/04/21\_Expert-systems\_Agriculture.pdf](https://saravananraj.in/wp-content/uploads/2020/04/21_Expert-systems_Agriculture.pdf)  
19. Rule Based Expert System for Rose Plant \- International Journal of ..., accessed on September 14, 2025, [https://www.ijert.org/research/rule-based-expert-system-for-rose-plant-IJERTV1IS5343.pdf](https://www.ijert.org/research/rule-based-expert-system-for-rose-plant-IJERTV1IS5343.pdf)  
20. Brinjal Pests With Images: Diseases & Borer Management \- Farmonaut, accessed on September 14, 2025, [https://farmonaut.com/blogs/brinjal-pests-with-images-diseases-borer-management](https://farmonaut.com/blogs/brinjal-pests-with-images-diseases-borer-management)  
21. Brinjal Pests and Diseases (Eggplant), Symptoms, Control \- AgriBegri, accessed on September 14, 2025, [https://blog.agribegri.com/en/blog/brinjal-pests-and-diseases-eggplant-symptoms-control](https://blog.agribegri.com/en/blog/brinjal-pests-and-diseases-eggplant-symptoms-control)  
22. Integrated Pest Management to Control Fruit Borers in Tomato, Brinjal, and Pea Crops \- IARI Advisory \- Global Agriculture, accessed on September 14, 2025, [https://www.global-agriculture.com/farming-agriculture/integrated-pest-management-to-control-fruit-borers-in-tomato-brinjal-and-pea-crops-iari-advisory/](https://www.global-agriculture.com/farming-agriculture/integrated-pest-management-to-control-fruit-borers-in-tomato-brinjal-and-pea-crops-iari-advisory/)  
23. Eggplant Leaf Disease Detection Dataset \- Mendeley Data, accessed on September 14, 2025, [https://data.mendeley.com/datasets/d3ypkphghb](https://data.mendeley.com/datasets/d3ypkphghb)
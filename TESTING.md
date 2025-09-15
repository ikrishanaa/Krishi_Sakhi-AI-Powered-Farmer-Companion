# Krishi Mitra - Testing Strategy & Instructions

## Overview
This document provides comprehensive testing guidelines for the Krishi Mitra application, covering unit tests, integration tests, component tests, and end-to-end testing strategies.

---

## **Testing Framework Configuration**

### Backend Testing Stack
- **Jest**: Primary testing framework for unit and integration tests
- **Supertest**: HTTP assertion library for API endpoint testing
- **ts-jest**: TypeScript integration for Jest
- **@testcontainers/postgresql**: Isolated PostgreSQL instances for integration tests
- **MSW (Mock Service Worker)**: External API mocking

### Frontend Testing Stack
- **Jest**: Unit testing framework
- **React Testing Library**: Component testing with accessibility focus
- **@testing-library/jest-dom**: Additional DOM matchers
- **Cypress**: End-to-end testing framework
- **@testing-library/user-event**: User interaction simulation
- **MSW**: API mocking for frontend tests

---

## **Test Configuration Files**

### Backend Jest Configuration (`server/jest.config.js`)
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/database/migrations/**',
    '!src/database/seeds/**',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  testTimeout: 10000,
};
```

### Frontend Jest Configuration (`client/jest.config.js`)
```javascript
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/**', // Next.js app router files
  ],
  coverageDirectory: 'coverage',
  testMatch: [
    '<rootDir>/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
    '<rootDir>/src/**/__tests__/**/*.(test|spec).(js|jsx|ts|tsx)',
  ],
};
```

### Cypress Configuration (`client/cypress.config.ts`)
```typescript
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    supportFile: '__tests__/e2e/support/index.ts',
    specPattern: '__tests__/e2e/**/*.cy.ts',
    video: false,
    screenshotOnRunFailure: true,
  },
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    specPattern: '__tests__/components/**/*.cy.tsx',
  },
});
```

---

## **Backend Testing Strategy**

### 1. **Unit Tests - Services & Utilities**

**Example: Advisory Engine Service Test**
```typescript
// server/__tests__/services/AdvisoryEngine.test.ts
import { AdvisoryEngine } from '../../src/services/AdvisoryEngine';
import { AdvisoryRule } from '../../src/models/AdvisoryRule';

describe('AdvisoryEngine', () => {
  let engine: AdvisoryEngine;

  beforeEach(() => {
    engine = new AdvisoryEngine();
  });

  describe('getRecommendation', () => {
    it('should return fertilizer advice for brinjal after 20 days', async () => {
      // Mock rule data
      const mockRules = [
        {
          crop_name: 'brinjal',
          trigger_event: 'fertilizer',
          conditions: { days_since_sowing: { gt: 15, lt: 30 }, soil_type: 'sandy' },
          recommendation_key: 'BRINJAL_FERT_1_SANDY',
          priority: 1,
        },
      ];

      // Mock database query
      jest.spyOn(AdvisoryRule, 'findAll').mockResolvedValue(mockRules as any);

      const context = {
        crop_name: 'brinjal',
        days_since_sowing: 25,
        soil_type: 'sandy',
      };

      const result = await engine.getRecommendation('fertilizer', context);

      expect(result.recommendation_key).toBe('BRINJAL_FERT_1_SANDY');
      expect(result.confidence).toBeGreaterThan(0.8);
    });

    it('should handle no matching rules gracefully', async () => {
      jest.spyOn(AdvisoryRule, 'findAll').mockResolvedValue([]);

      const context = {
        crop_name: 'unknown_crop',
        days_since_sowing: 10,
        soil_type: 'clay',
      };

      const result = await engine.getRecommendation('fertilizer', context);

      expect(result.recommendation_key).toBe('GENERAL_ADVICE');
      expect(result.confidence).toBeLessThan(0.5);
    });
  });
});
```

### 2. **Integration Tests - API Endpoints**

**Example: Authentication API Test**
```typescript
// server/__tests__/api/auth.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { User } from '../../src/models/User';
import { SMSService } from '../../src/services/SMSService';

describe('/api/auth', () => {
  beforeEach(async () => {
    await User.destroy({ where: {} });
  });

  describe('POST /api/auth/otp', () => {
    it('should send OTP for valid phone number', async () => {
      const smsServiceSpy = jest.spyOn(SMSService.prototype, 'sendOTP')
        .mockResolvedValue({ success: true, messageId: 'test-123' });

      const response = await request(app)
        .post('/api/auth/otp')
        .send({ phoneNumber: '+919876543210' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('sent');
      expect(smsServiceSpy).toHaveBeenCalledWith('+919876543210', expect.any(String));
    });

    it('should reject invalid phone number', async () => {
      const response = await request(app)
        .post('/api/auth/otp')
        .send({ phoneNumber: 'invalid' })
        .expect(400);

      expect(response.body.error).toContain('phone number');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should authenticate with valid OTP', async () => {
      // Create user with OTP
      const user = await User.create({
        phone_number: '+919876543210',
        otp_code: '123456',
        otp_expires_at: new Date(Date.now() + 5 * 60 * 1000),
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ phoneNumber: '+919876543210', otp: '123456' })
        .expect(200);

      expect(response.body.token).toBeDefined();
      expect(response.body.user.phone_number).toBe('+919876543210');
    });

    it('should reject expired OTP', async () => {
      const user = await User.create({
        phone_number: '+919876543210',
        otp_code: '123456',
        otp_expires_at: new Date(Date.now() - 1000), // Expired
      });

      const response = await request(app)
        .post('/api/auth/login')
        .send({ phoneNumber: '+919876543210', otp: '123456' })
        .expect(401);

      expect(response.body.error).toContain('expired');
    });
  });
});
```

### 3. **Database Tests**
```typescript
// server/__tests__/models/User.test.ts
import { User } from '../../src/models/User';
import { sequelize } from '../../src/config/database';

describe('User Model', () => {
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  afterEach(async () => {
    await User.destroy({ where: {} });
  });

  it('should create user with valid data', async () => {
    const userData = {
      phone_number: '+919876543210',
      name: 'Test Farmer',
      language_preference: 'ml',
    };

    const user = await User.create(userData);

    expect(user.phone_number).toBe(userData.phone_number);
    expect(user.name).toBe(userData.name);
    expect(user.id).toBeDefined();
  });

  it('should enforce unique phone number', async () => {
    await User.create({ phone_number: '+919876543210' });

    await expect(User.create({ phone_number: '+919876543210' }))
      .rejects.toThrow();
  });
});
```

---

## **Frontend Testing Strategy**

### 1. **Component Unit Tests**

**Example: Button Component Test**
```typescript
// client/__tests__/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../../../src/components/ui/Button';

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is accessible via keyboard', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button');
    button.focus();
    fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('shows loading state correctly', () => {
    render(<Button loading>Loading</Button>);
    
    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('meets accessibility contrast requirements', () => {
    const { container } = render(<Button variant="primary">Test</Button>);
    const button = container.firstChild as HTMLElement;
    
    const styles = window.getComputedStyle(button);
    // Add specific contrast ratio checks based on your design system
    expect(styles.backgroundColor).toBe('rgb(34, 197, 94)'); // Expected green
  });
});
```

### 2. **Form Component Tests with Validation**

**Example: Login Form Test**
```typescript
// client/__tests__/components/forms/LoginForm.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginForm } from '../../../src/components/forms/LoginForm';

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('validates phone number format', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '123');
    
    const submitButton = screen.getByRole('button', { name: /send otp/i });
    await user.click(submitButton);

    expect(screen.getByText(/enter a valid phone number/i)).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('submits form with valid phone number', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} />);

    const phoneInput = screen.getByLabelText(/phone number/i);
    await user.type(phoneInput, '+919876543210');
    
    const submitButton = screen.getByRole('button', { name: /send otp/i });
    await user.click(submitButton);

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        phoneNumber: '+919876543210',
      });
    });
  });

  it('shows OTP input after phone submission', async () => {
    const user = userEvent.setup();
    render(<LoginForm onSubmit={mockOnSubmit} showOTPInput />);

    expect(screen.getByLabelText(/enter otp/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /verify/i })).toBeInTheDocument();
  });
});
```

### 3. **Custom Hook Tests**

**Example: useAuth Hook Test**
```typescript
// client/__tests__/hooks/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../../src/hooks/useAuth';
import { AuthProvider } from '../../src/contexts/AuthContext';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

describe('useAuth', () => {
  it('should start with no authenticated user', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should handle login successfully', async () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('+919876543210', '123456');
    });

    expect(result.current.user).toMatchObject({
      phone_number: '+919876543210',
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should handle logout', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    act(() => {
      result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
  });
});
```

---

## **End-to-End Testing Strategy**

### 1. **Authentication Flow Test**
```typescript
// client/__tests__/e2e/auth-flow.cy.ts
describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/auth/login');
  });

  it('should complete full authentication flow', () => {
    // Enter phone number
    cy.get('[data-testid="phone-input"]').type('+919876543210');
    cy.get('[data-testid="send-otp-button"]').click();

    // Verify OTP screen appears
    cy.get('[data-testid="otp-input"]').should('be.visible');
    cy.get('[data-testid="otp-input"]').type('123456');
    cy.get('[data-testid="verify-button"]').click();

    // Verify redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="welcome-message"]').should('contain', 'Welcome');
  });

  it('should show error for invalid OTP', () => {
    cy.get('[data-testid="phone-input"]').type('+919876543210');
    cy.get('[data-testid="send-otp-button"]').click();
    
    cy.get('[data-testid="otp-input"]').type('000000');
    cy.get('[data-testid="verify-button"]').click();

    cy.get('[data-testid="error-message"]')
      .should('be.visible')
      .and('contain', 'Invalid OTP');
  });

  it('should support demo mode', () => {
    cy.get('[data-testid="demo-mode-button"]').click();
    
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="demo-badge"]').should('be.visible');
  });
});
```

### 2. **Onboarding Flow Test**
```typescript
// client/__tests__/e2e/onboarding.cy.ts
describe('User Onboarding', () => {
  beforeEach(() => {
    // Login and start onboarding
    cy.login(); // Custom command
    cy.visit('/onboarding');
  });

  it('should complete profile setup', () => {
    // Profile step
    cy.get('[data-testid="name-input"]').type('Test Farmer');
    cy.get('[data-testid="language-select"]').select('Malayalam');
    cy.get('[data-testid="continue-button"]').click();

    // Farm setup step
    cy.get('[data-testid="farm-name-input"]').type('My Farm');
    cy.get('[data-testid="soil-type-select"]').select('Loamy');
    cy.get('[data-testid="irrigation-select"]').select('Borewell');
    
    // Location selection (mock geolocation)
    cy.window().then((win) => {
      cy.stub(win.navigator.geolocation, 'getCurrentPosition').callsFake((success) => {
        success({
          coords: {
            latitude: 10.8505,
            longitude: 76.2711, // Thrissur, Kerala
          },
        });
      });
    });
    
    cy.get('[data-testid="use-current-location"]').click();
    cy.get('[data-testid="complete-setup"]').click();

    // Verify completion
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="farm-card"]').should('contain', 'My Farm');
  });
});
```

### 3. **Advisory Chat Test**
```typescript
// client/__tests__/e2e/advisory-chat.cy.ts
describe('Advisory Chat', () => {
  beforeEach(() => {
    cy.login();
    cy.setupFarm(); // Custom command to set up farm data
    cy.visit('/chat');
  });

  it('should provide fertilizer advice', () => {
    cy.get('[data-testid="advice-category"]').contains('Fertilizer').click();
    cy.get('[data-testid="crop-select"]').select('Brinjal');
    cy.get('[data-testid="get-advice-button"]').click();

    cy.get('[data-testid="advisory-response"]')
      .should('be.visible')
      .and('contain', 'fertilizer');

    // Test voice feature if supported
    cy.get('[data-testid="voice-button"]').click();
    // Audio testing would require specific setup
  });

  it('should handle pest identification', () => {
    cy.get('[data-testid="advice-category"]').contains('Pest Problem').click();
    
    // Mock file upload
    cy.get('[data-testid="image-upload"]').selectFile({
      contents: Cypress.Buffer.from('fake-image-data'),
      fileName: 'pest.jpg',
      mimeType: 'image/jpeg',
    });

    cy.get('[data-testid="analyze-button"]').click();
    cy.get('[data-testid="pest-result"]').should('be.visible');
  });
});
```

---

## **Accessibility Testing Strategy**

### 1. **Automated Accessibility Tests**
```typescript
// client/__tests__/accessibility/wcag.test.tsx
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { LoginForm } from '../../src/components/forms/LoginForm';

expect.extend(toHaveNoViolations);

describe('WCAG Compliance', () => {
  it('LoginForm should not have accessibility violations', async () => {
    const { container } = render(<LoginForm onSubmit={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should have proper heading hierarchy', () => {
    render(<LoginForm onSubmit={jest.fn()} />);
    
    // Check heading levels are sequential
    const h1 = document.querySelector('h1');
    const h2 = document.querySelector('h2');
    
    expect(h1).toBeInTheDocument();
    if (h2) {
      expect(h1).toBeInTheDocument(); // h2 should follow h1
    }
  });

  it('should have sufficient color contrast', async () => {
    const { container } = render(<LoginForm onSubmit={jest.fn()} />);
    
    // This would require specific contrast checking logic
    // or integration with tools like Pa11y
    const buttons = container.querySelectorAll('button');
    buttons.forEach(button => {
      const styles = window.getComputedStyle(button);
      // Add contrast ratio calculations
    });
  });
});
```

---

## **Test Execution Instructions**

### Development Environment Setup
```bash
# Install dependencies
cd server && npm install
cd client && npm install

# Set up test databases
npm run test:db:setup

# Run database migrations for testing
npm run test:db:migrate
```

### Running Tests

**Backend Tests:**
```bash
cd server

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test suites
npm test -- --testPathPattern=auth
npm test -- --testPathPattern=services

# Run tests in watch mode
npm test -- --watch

# Run integration tests only
npm run test:integration
```

**Frontend Tests:**
```bash
cd client

# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific component tests
npm test -- Button.test.tsx

# Run tests in watch mode
npm test -- --watch

# Run accessibility tests
npm run test:a11y
```

**End-to-End Tests:**
```bash
cd client

# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:open

# Run specific E2E test
npx cypress run --spec "__tests__/e2e/auth-flow.cy.ts"
```

**Full Test Suite:**
```bash
# From project root
npm run test:all

# With coverage report
npm run test:all:coverage

# Generate combined coverage report
npm run coverage:merge
```

### Continuous Integration Setup

**GitHub Actions Configuration (`.github/workflows/test.yml`):**
```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install backend dependencies
        run: cd server && npm ci
      
      - name: Run backend tests
        run: cd server && npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3

  frontend:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install frontend dependencies
        run: cd client && npm ci
      
      - name: Run frontend tests
        run: cd client && npm run test:coverage
      
      - name: Run E2E tests
        run: cd client && npm run test:e2e:ci
```

### Coverage Reports
- **Target Coverage**: 80%+ for services and utilities
- **Report Formats**: HTML, LCOV, Text
- **Coverage Locations**: 
  - Backend: `server/coverage/`
  - Frontend: `client/coverage/`

### Test Data Management
- Use factories for consistent test data
- Clean up test data after each test
- Use transactions for database tests when possible
- Mock external services consistently

This comprehensive testing strategy ensures high code quality, accessibility compliance, and reliable functionality across the entire Krishi Mitra application.
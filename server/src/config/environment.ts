// server/src/config/environment.ts
// Centralized environment variable management with safe defaults for dev
// and strict validation for production environments.

import 'dotenv/config';
import { z } from 'zod';

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),

  // CORS
  CORS_ORIGIN: z.string().default('*'),

  // JWT
  JWT_SECRET: z.string().min(16, 'JWT_SECRET must be at least 16 characters').default('dev_secret_change_me'),
  JWT_EXPIRES_IN: z.string().default('7d'),

  // Database (Prisma will use DATABASE_URL)
  DATABASE_URL: z
    .string()
    .url('DATABASE_URL must be a valid URL')
    .default('postgresql://postgres:postgres@localhost:5432/krishi_mitra?schema=public'),

  // Twilio (optional in demo mode)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_MESSAGING_SERVICE_SID: z.string().optional(),

  // Feature flags
  DEMO_MODE: z.coerce.boolean().default(true), // allows OTP bypass for demo
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  // In production, fail fast if env invalid
  if (process.env.NODE_ENV === 'production') {
    // eslint-disable-next-line no-console
    console.error('Invalid environment configuration:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  // In dev/test, log and continue with defaults
  // eslint-disable-next-line no-console
  console.warn('[env] Using defaults due to validation issues:', parsed.error.flatten().fieldErrors);
}

export const env = parsed.success ? parsed.data : EnvSchema.parse({});

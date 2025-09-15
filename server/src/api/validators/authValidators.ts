// server/src/api/validators/authValidators.ts
// Zod schemas for validating auth-related requests.

import { z } from 'zod';

export const requestOtpSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?\d{10,15}$/, 'Enter a valid phone number with country code'),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;

export const loginSchema = z.object({
  phoneNumber: z
    .string()
    .regex(/^\+?\d{10,15}$/, 'Enter a valid phone number with country code'),
  otp: z.string().min(4).max(8),
});

export type LoginInput = z.infer<typeof loginSchema>;

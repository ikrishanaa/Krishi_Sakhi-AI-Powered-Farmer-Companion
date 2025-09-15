// server/src/services/AuthService.ts
// Handles OTP generation/verification and JWT issuance.

import dayjs from 'dayjs';
import { prisma } from '../config/database';
import { env } from '../config/environment';
import { signToken } from '../config/jwt';
import { SMSService } from './SMSService';

function generateOtp(): string {
  // 6-digit numeric OTP
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class AuthService {
  private sms: SMSService;

  constructor() {
    this.sms = new SMSService();
  }

  async requestOtp(phoneNumber: string): Promise<{ success: boolean }>{
    const otp = generateOtp();
    const expiresAt = dayjs().add(5, 'minute').toDate();

    // Upsert user and store OTP
    await prisma.user.upsert({
      where: { phone_number: phoneNumber },
      update: {
        otp_code: otp,
        otp_expires_at: expiresAt,
      },
      create: {
        phone_number: phoneNumber,
        otp_code: otp,
        otp_expires_at: expiresAt,
      },
    });

    await this.sms.sendOTP(phoneNumber, otp);

    return { success: true };
  }

  async login(phoneNumber: string, otp: string): Promise<{ token: string; user: any }>{
    if (env.DEMO_MODE && otp === '000000') {
      // Demo login flow, create/find user without verifying stored OTP
      const user = await prisma.user.upsert({
        where: { phone_number: phoneNumber },
        update: {},
        create: { phone_number: phoneNumber, name: 'Demo User', language_preference: 'ml' },
      });
      const token = signToken({ sub: String(user.id), phone: user.phone_number, demo: true });
      return { token, user };
    }

    const user = await prisma.user.findUnique({ where: { phone_number: phoneNumber } });
    if (!user || !user.otp_code || !user.otp_expires_at) {
      throw Object.assign(new Error('OTP not requested'), { status: 400 });
    }

    const now = new Date();
    if (user.otp_code !== otp || user.otp_expires_at < now) {
      throw Object.assign(new Error('Invalid or expired OTP'), { status: 401 });
    }

    // Clear OTP and issue JWT
    const updated = await prisma.user.update({
      where: { phone_number: phoneNumber },
      data: { otp_code: null, otp_expires_at: null },
    });

    const token = signToken({ sub: String(updated.id), phone: updated.phone_number });
    return { token, user: updated };
  }
}

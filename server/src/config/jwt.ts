// server/src/config/jwt.ts
// JWT signing and verification helpers with sensible defaults.

import jwt from 'jsonwebtoken';
import { env } from './environment';

export type JwtPayload = {
  sub: string; // user id
  phone?: string;
  demo?: boolean;
};

export function signToken(payload: JwtPayload, expiresIn: string = env.JWT_EXPIRES_IN): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
}

export function verifyToken<T = JwtPayload>(token: string): T {
  return jwt.verify(token, env.JWT_SECRET) as T;
}

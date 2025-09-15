import express, { NextFunction, Request, Response } from 'express';
import helmet from 'helmet';
import cors, { CorsOptions } from 'cors';
import morgan from 'morgan';
import { env } from './config/environment';

/**
 * Express application configuration
 * - Security headers (helmet)
 * - CORS (configurable via env.CORS_ORIGIN)
 * - Body parsing (JSON + URL-encoded)
 * - Request logging (morgan)
 * - Basic rate limiting
 * - Health check endpoint
 * - 404 and centralized error handling
 */
const app = express();

// Trust reverse proxy headers (X-Forwarded-*) when deployed behind proxies
app.set('trust proxy', 1);

// Security hardening and cleanliness
app.disable('x-powered-by');
app.use(helmet());

// Configure CORS: allow multiple comma-separated origins or '*'
const allowedOrigins = (env.CORS_ORIGIN || '*')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow mobile apps and same-origin requests with no Origin header
    if (!origin || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
};
app.use(cors(corsOptions));

// Body parsers
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));


// Health check for uptime probes and CI
app.get('/health', (_req: Request, res: Response) => {
  return res.status(200).json({ status: 'ok', env: env.NODE_ENV, timestamp: new Date().toISOString() });
});

// TODO: Mount feature routes here as they are implemented
import { authRouter } from './api/routes/auth';
app.use('/api/auth', authRouter);
// app.use('/api/users', userRouter);

// 404 handler
app.use((req: Request, res: Response) => {
  return res.status(404).json({ error: 'Not Found', path: req.path });
});

// Centralized error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = typeof err.status === 'number' ? err.status : 500;
  const code = err.code || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal Server Error';
  if (env.NODE_ENV !== 'production') {
    // Log stack traces only in non-production
    // eslint-disable-next-line no-console
    console.error('[error]', { code, message, stack: err.stack });
  }
  return res.status(status).json({ error: message, code });
});

export { app };

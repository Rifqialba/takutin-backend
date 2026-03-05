import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import Logger from './utils/logger';
import v1Routes from './routes/v1';
import { errorHandler, NotFoundError } from './middleware/error.middleware';
import { validateEnvironment } from './config/validation';

validateEnvironment();

const app = express();

// ========== KONFIGURASI CORS (SATU KALI, SEBELUM MIDDLEWARE LAIN) ==========
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
  : process.env.NODE_ENV === 'production'
    ? ['https://takutin-frontend.vercel.app', 'https://takutin.vercel.app']
    : ['http://localhost:3001'];

Logger.info('CORS allowed origins:', allowedOrigins);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

// ========== MIDDLEWARE LAINNYA ==========
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX_REQUESTS,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Logging
app.use((req: Request, res: Response, next: NextFunction) => {
  Logger.http(`${req.method} ${req.url}`);
  next();
});

// Health check (public)
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

// API Routes
app.use(`${config.API_PREFIX}`, v1Routes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  next(new NotFoundError('Route'));
});

// Error handler
app.use(errorHandler);

export default app;

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { authRouter } from './routes/auth';
import { leaderboardRouter } from './routes/leaderboard';
import { adminRouter } from './routes/admin';
import type { ApiResponse } from '@genius-unu/shared';

const app = new Hono();

// Middlewares
app.use('*', logger());
app.use(
  '*',
  cors({
    origin: ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002', 'http://localhost:5173'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json<ApiResponse>({
    success: true,
    message: 'GENIUS UNU 2026 API Backend is running healthy 🚀',
    data: {
      status: 'UP',
      service: '@genius-unu/backend',
      timestamp: new Date().toISOString(),
    },
    timestamp: new Date().toISOString(),
  });
});

// Mount modular sub-routers
app.route('/api/auth', authRouter);
app.route('/api/leaderboard', leaderboardRouter);
app.route('/api/admin', adminRouter);

const PORT = Number(process.env.PORT) || 3001;

console.log(`[GENIUS UNU 2026] Backend server listening on http://localhost:${PORT}`);

export default {
  port: PORT,
  fetch: app.fetch,
};

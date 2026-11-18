import { env } from './env.js';

export const corsOptions = {
  origin(origin, callback) {
    // Allow non-browser clients (curl, Postman, server-to-server) with no Origin header
    if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

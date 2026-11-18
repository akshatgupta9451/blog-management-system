import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { API_PREFIX, BLOG_JSON_LIMIT, JSON_LIMIT } from './constants/index.js';
import routes from './routes/index.js';
import { notFound } from './middlewares/notFound.middleware.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(cors(corsOptions));
// Runs first for blog routes; the global parser below then skips the already-parsed body
app.use(`${API_PREFIX}/blogs`, express.json({ limit: BLOG_JSON_LIMIT }));
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));
app.use(cookieParser());

app.use(API_PREFIX, routes);

app.use(notFound);
app.use(errorHandler);

export default app;

import dotenv from 'dotenv';

dotenv.config({ quiet: true });

const required = ['MONGODB_URI', 'ACCESS_TOKEN_SECRET', 'REFRESH_TOKEN_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

export const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 5000,
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim()),
  mongodbUri: process.env.MONGODB_URI,
  dbName: process.env.DB_NAME || 'blog_db',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d',
  // Keys the hash of anonymous viewers' IP + user agent, so raw IPs are never stored
  viewHashSecret: process.env.VIEW_HASH_SECRET || process.env.ACCESS_TOKEN_SECRET,
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
    // Root folder for every upload. Use a different one per environment (e.g.
    // "blog-management-dev") so development never touches production images.
    folder: process.env.CLOUDINARY_FOLDER || 'blog-management',
  },
});

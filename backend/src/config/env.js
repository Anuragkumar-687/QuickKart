'use strict';

const dotenv = require('dotenv');
dotenv.config();

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return String(value).toLowerCase() === 'true';
}

const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 5000,

  DATABASE_URL: process.env.DATABASE_URL || '',

  JWT_SECRET: process.env.JWT_SECRET || 'quickkart_insecure_dev_secret_change_me',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',

  REDIS_URL: process.env.REDIS_URL || '',

  ENABLE_CRON: bool(process.env.ENABLE_CRON, false),

  CLIENT_ORIGINS: (
    process.env.CLIENT_ORIGINS ||
    'http://localhost:3000,https://ecommercee-webiste.vercel.app'
  )
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

env.isProd = env.NODE_ENV === 'production';
env.isDev = env.NODE_ENV === 'development';

// Fail loudly on misconfiguration that would silently break auth (the old bug).
if (!process.env.JWT_SECRET) {
  // eslint-disable-next-line no-console
  console.warn(
    '[env] JWT_SECRET is not set — using an INSECURE development default. ' +
      'Set JWT_SECRET in backend/.env before deploying.'
  );
}
if (!env.DATABASE_URL) {
  // eslint-disable-next-line no-console
  console.warn('[env] DATABASE_URL is not set — Prisma will fail to connect.');
}

module.exports = env;

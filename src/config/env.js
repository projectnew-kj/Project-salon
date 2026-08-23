const dotenv = require('dotenv');
dotenv.config();

module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT, 10) || 5000,
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/salon_booking_db',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'salon_jwt_access_secret_super_secure_key_2026',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'salon_jwt_refresh_secret_super_secure_key_2026',
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@salon.com',
  DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@Secure2026!',
  DEFAULT_ADMIN_NAME: process.env.DEFAULT_ADMIN_NAME || 'Super Administrator',
  DEFAULT_ADMIN_PHONE: process.env.DEFAULT_ADMIN_PHONE || '+1234567890',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*'
};
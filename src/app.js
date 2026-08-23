const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const env = require('./config/env');
const v1Router = require('./routes/v1');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { apiLimiter, authLimiter } = require('./middlewares/rateLimiter');
const setupSwagger = require('./config/swagger');
const ApiError = require('./utils/apiError');
const httpStatusCodes = require('./constants/httpStatusCodes');

const app = express();

// Security Headers
app.use(helmet());

// CORS Config
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Swagger Documentation
setupSwagger(app);

// Global Rate Limiting
app.use('/api/', apiLimiter);
app.use('/api/v1/auth/', authLimiter);

// Health Check
app.get('/health', (req, res) => {
  res.status(httpStatusCodes.OK).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Mount API v1
app.use('/api/v1', v1Router);

// 404 Fallthrough Catch Handler
app.use((req, res, next) => {
  next(new ApiError(httpStatusCodes.NOT_FOUND, `Resource not found on endpoint ${req.originalUrl}`));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;
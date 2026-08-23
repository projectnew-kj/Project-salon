const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const socketAuth = require('./sockets/socketMiddleware');
const registerSocketHandlers = require('./sockets/socketHandler');
const socketEmitter = require('./sockets/socketEmitter');

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Attach Socket Auth Middleware
io.use(socketAuth);

// Register Socket Event Listeners
registerSocketHandlers(io);

// Pass IO reference to Emitter singleton
socketEmitter.init(io);

// Server startup
const startServer = async () => {
  await connectDB();

  server.listen(env.PORT, () => {
    logger.info(`===============================================`);
    logger.info(`🚀 Haircut Booking Platform Backend is LIVE`);
    logger.info(`🌐 Server running on: http://localhost:${env.PORT}`);
    logger.info(`📖 Swagger Docs: http://localhost:${env.PORT}/api-docs`);
    logger.info(`⚡ Socket.IO listening on port: ${env.PORT}`);
    logger.info(`🔧 Environment: ${env.NODE_ENV}`);
    logger.info(`===============================================`);
  });
};

// Graceful Shutdown
const exitHandler = () => {
  if (server) {
    server.close(() => {
      logger.info('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
};

const unexpectedErrorHandler = (error) => {
  logger.error(`Unexpected Error: ${error.stack || error}`);
  exitHandler();
};

process.on('uncaughtException', unexpectedErrorHandler);
process.on('unhandledRejection', unexpectedErrorHandler);

process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
  });
});

startServer();
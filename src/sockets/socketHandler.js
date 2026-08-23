const logger = require('../config/logger');
const socketEvents = require('../constants/socketEvents');
const roles = require('../constants/roles');

const registerSocketHandlers = (io) => {
  io.on(socketEvents.CONNECTION, (socket) => {
    logger.info(`Socket connected: ${socket.id} | Role: ${socket.role || 'GUEST'}`);

    // Dynamic Room Allocation based on Auth Role
    if (socket.role === roles.ADMIN) {
      socket.join('admin');
      logger.info(`Admin socket ${socket.id} joined 'admin' room`);
    } else if (socket.role === roles.USER && socket.user) {
      const userRoom = `user:${socket.user._id.toString()}`;
      socket.join(userRoom);
      logger.info(`User socket ${socket.id} joined '${userRoom}'`);
    }

    // Join specific live booking channel (for active tracking screens)
    socket.on('join:booking', (bookingId) => {
      if (bookingId) {
        socket.join(`booking:${bookingId}`);
        logger.debug(`Socket ${socket.id} joined room booking:${bookingId}`);
      }
    });

    // Leave specific live booking channel
    socket.on('leave:booking', (bookingId) => {
      if (bookingId) {
        socket.leave(`booking:${bookingId}`);
        logger.debug(`Socket ${socket.id} left room booking:${bookingId}`);
      }
    });

    socket.on(socketEvents.DISCONNECT, (reason) => {
      logger.info(`Socket disconnected: ${socket.id} (Reason: ${reason})`);
    });
  });
};

module.exports = registerSocketHandlers;
const jwt = require('jsonwebtoken');
const env = require('../config/env');
const Admin = require('../models/Admin');
const User = require('../models/User');
const roles = require('../constants/roles');
const logger = require('../config/logger');

const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      // Allow guest connections to public room only
      socket.user = null;
      socket.role = 'GUEST';
      return next();
    }

    const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
    let account;

    if (decoded.role === roles.ADMIN) {
      account = await Admin.findById(decoded.id).select('_id name email role isActive');
    } else {
      account = await User.findById(decoded.id).select('_id name email role isActive isBlocked');
    }

    if (!account || !account.isActive || (account.isBlocked && account.isBlocked === true)) {
      return next(new Error('Authentication failed: Account inactive or blocked'));
    }

    socket.user = account;
    socket.role = decoded.role;
    next();
  } catch (err) {
    logger.warn(`Socket Auth Handshake rejected: ${err.message}`);
    return next(new Error('Authentication error: Invalid Token'));
  }
};

module.exports = socketAuth;
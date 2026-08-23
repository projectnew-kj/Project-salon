const mongoose = require('mongoose');
const roles = require('../constants/roles');

const refreshTokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'userModel',
      index: true
    },
    userModel: {
      type: String,
      required: true,
      enum: ['Admin', 'User']
    },
    role: {
      type: String,
      required: true,
      enum: [roles.ADMIN, roles.USER]
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 } // Automatic TTL expiration index
    },
    isRevoked: {
      type: Boolean,
      default: false
    },
    ipAddress: String,
    userAgent: String
  },
  {
    timestamps: true
  }
);

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);
module.exports = RefreshToken;
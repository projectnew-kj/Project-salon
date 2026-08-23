const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const env = require('../config/env');
const RefreshToken = require('../models/RefreshToken');
const ApiError = require('../utils/apiError');
const httpStatusCodes = require('../constants/httpStatusCodes');

class TokenService {
  generateAccessToken(payload) {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    });
  }

  generateRefreshTokenString() {
    return crypto.randomBytes(40).toString('hex');
  }

  async generateAuthTokens(user, role, ipAddress = '', userAgent = '') {
    const userModel = role === 'ADMIN' ? 'Admin' : 'User';
    const accessTokenPayload = {
      id: user._id.toString(),
      email: user.email,
      role: role
    };

    const accessToken = this.generateAccessToken(accessTokenPayload);
    const refreshTokenString = this.generateRefreshTokenString();

    const refreshExpiresAt = new Date();
    // 7 days default
    refreshExpiresAt.setDate(refreshExpiresAt.getDate() + 7);

    await RefreshToken.create({
      token: refreshTokenString,
      userId: user._id,
      userModel,
      role,
      expiresAt: refreshExpiresAt,
      ipAddress,
      userAgent
    });

    return {
      accessToken,
      refreshToken: refreshTokenString,
      expiresIn: env.JWT_ACCESS_EXPIRES_IN
    };
  }

  async verifyAccessToken(token) {
    return jwt.verify(token, env.JWT_ACCESS_SECRET);
  }

  async rotateRefreshToken(oldRefreshTokenString, ipAddress = '', userAgent = '') {
    const existingToken = await RefreshToken.findOne({
      token: oldRefreshTokenString,
      isRevoked: false
    });

    if (!existingToken || existingToken.expiresAt < new Date()) {
      throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Invalid or expired refresh token');
    }

    // Revoke old token
    existingToken.isRevoked = true;
    await existingToken.save();

    const userModel = existingToken.role === 'ADMIN' ? require('../models/Admin') : require('../models/User');
    const user = await userModel.findById(existingToken.userId);

    if (!user || !user.isActive || (user.isBlocked && user.isBlocked === true)) {
      throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'User is inactive or blocked');
    }

    return await this.generateAuthTokens(user, existingToken.role, ipAddress, userAgent);
  }

  async revokeToken(tokenString) {
    await RefreshToken.updateOne({ token: tokenString }, { $set: { isRevoked: true } });
  }

  async revokeAllUserSessions(userId) {
    await RefreshToken.updateMany({ userId, isRevoked: false }, { $set: { isRevoked: true } });
  }
}

module.exports = new TokenService();
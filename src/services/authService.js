const User = require('../models/User');
const Admin = require('../models/Admin');
const tokenService = require('./tokenService');
const ApiError = require('../utils/apiError');
const httpStatusCodes = require('../constants/httpStatusCodes');
const roles = require('../constants/roles');

class AuthService {
  // Registers a new customer account
  async registerUser({ name, email, password, phone, preferredLanguage }) {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ApiError(httpStatusCodes.CONFLICT, 'An account with this email already exists');
    }

    const user = await User.create({
      name,
      email,
      password,
      phone: phone || '',
      preferredLanguage: preferredLanguage || 'en'
    });

    return user;
  }

  // Authenticates a customer by email/password
  async authenticateUser(email, password) {
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Invalid email or password');
    }

    if (!user.isActive || user.isBlocked) {
      throw new ApiError(httpStatusCodes.FORBIDDEN, 'Account is suspended or deactivated');
    }

    return user;
  }

  // Authenticates an admin by email/password
  async authenticateAdmin(email, password) {
    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin || !(await admin.comparePassword(password))) {
      throw new ApiError(httpStatusCodes.UNAUTHORIZED, 'Invalid credentials');
    }

    if (!admin.isActive) {
      throw new ApiError(httpStatusCodes.FORBIDDEN, 'Admin account has been deactivated');
    }

    return admin;
  }

  // Issues an access/refresh token pair for a given account and role
  async issueTokens(account, role, ipAddress = '', userAgent = '') {
    return tokenService.generateAuthTokens(account, role, ipAddress, userAgent);
  }

  // Convenience wrapper: full login flow producing sanitized profile + tokens
  async loginUser(email, password, ipAddress, userAgent) {
    const user = await this.authenticateUser(email, password);
    const tokens = await this.issueTokens(user, roles.USER, ipAddress, userAgent);
    return { user, tokens };
  }

  async loginAdmin(email, password, ipAddress, userAgent) {
    const admin = await this.authenticateAdmin(email, password);
    const tokens = await this.issueTokens(admin, roles.ADMIN, ipAddress, userAgent);
    return { admin, tokens };
  }

  async refreshSession(refreshTokenString, ipAddress, userAgent) {
    return tokenService.rotateRefreshToken(refreshTokenString, ipAddress, userAgent);
  }

  async logout(refreshTokenString) {
    if (refreshTokenString) {
      await tokenService.revokeToken(refreshTokenString);
    }
  }

  async changePassword(account, currentPassword, newPassword, role) {
    if (!(await account.comparePassword(currentPassword))) {
      throw new ApiError(httpStatusCodes.BAD_REQUEST, 'Incorrect current password');
    }

    account.password = newPassword;
    await account.save();

    // Invalidate all previous sessions and mint a fresh pair
    await tokenService.revokeAllUserSessions(account._id);
    const tokens = await tokenService.generateAuthTokens(account, role);

    return tokens;
  }
}

module.exports = new AuthService();

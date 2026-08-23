const mongoose = require('mongoose');
const env = require('../config/env');
const Admin = require('../models/Admin');
const logger = require('../config/logger');

const seedAdmin = async () => {
  try {
    await mongoose.connect(env.MONGO_URI);
    logger.info('Connected to MongoDB for Seeding...');

    const existingAdmin = await Admin.findOne({ email: env.DEFAULT_ADMIN_EMAIL });
    if (existingAdmin) {
      logger.info(`Admin already exists with email: ${env.DEFAULT_ADMIN_EMAIL}`);
      process.exit(0);
    }

    const admin = await Admin.create({
      name: env.DEFAULT_ADMIN_NAME,
      email: env.DEFAULT_ADMIN_EMAIL,
      password: env.DEFAULT_ADMIN_PASSWORD,
      phone: env.DEFAULT_ADMIN_PHONE,
      isActive: true
    });

    logger.info(`Default Admin successfully created: ${admin.email}`);
    process.exit(0);
  } catch (error) {
    logger.error(`Failed to seed admin: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
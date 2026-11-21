const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const connectDB = require('../config/db');
const User = require('../models/User');

const seedAdmin = async () => {
  try {
    const adminEmail = (process.env.ADMIN_EMAIL || '').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('[Seed] ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    console.log('[Seed] Connecting to database...');
    await connectDB();

    const existing = await User.findOne({ email: adminEmail });
    if (existing) {
      console.log(`[Seed] Admin ${adminEmail} already exists. Nothing to do.`);
      await mongoose.connection.close();
      process.exit(0);
    }

    const passwordHash = await bcrypt.hash(adminPassword, 10);
    await User.create({
      name: 'Campus Administrator',
      email: adminEmail,
      passwordHash,
      role: 'admin',
      department: 'Campus Operations',
    });

    console.log(`[Seed] Admin created: ${adminEmail}`);
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed] Error: ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
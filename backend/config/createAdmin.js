const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const User = require('../models/User');

const ADMIN_EMAIL    = 'admin@venuebooking.com';
const ADMIN_PASSWORD = 'Admin@12345';

const createAdmin = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    // Set plain password — the pre-save hook will hash it
    existing.password = ADMIN_PASSWORD;
    existing.role = 'admin';
    existing.isEmailVerified = true;
    await existing.save();
    console.log('Admin account updated.');
  } else {
    // Pass plain password — the pre-save hook hashes it automatically
    await User.create({
      firstName: 'Admin',
      lastName: 'User',
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      role: 'admin',
      isEmailVerified: true,
      phone: '+447700900001',
    });
    console.log('Admin account created.');
  }

  console.log('\n========================================');
  console.log('  Admin Credentials');
  console.log('========================================');
  console.log(`  Email    : ${ADMIN_EMAIL}`);
  console.log(`  Password : ${ADMIN_PASSWORD}`);
  console.log('========================================\n');

  await mongoose.disconnect();
  process.exit(0);
};

createAdmin().catch(err => { console.error(err); process.exit(1); });

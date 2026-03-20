const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    // Remove old admin if exists
    await User.deleteMany({ role: 'admin' });

    await User.create({
      name:     'Super Admin',
      email:    'admin@rentalbreaker.com',
      password: 'Admin@123',
      role:     'admin',
    });

    console.log('✅ Admin account seeded successfully!');
    console.log('   Email:    admin@rentalbreaker.com');
    console.log('   Password: Admin@123');
    process.exit();
  } catch (error) {
    console.error('❌ Seeder Error:', error.message);
    process.exit(1);
  }
});

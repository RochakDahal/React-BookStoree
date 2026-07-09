const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config();

const hashExistingPasswords = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI);
    console.log(' Connected to MongoDB');

    // Find all users (including those with plain-text passwords)
    const users = await User.find({}).select('+password');
    console.log(`Found ${users.length} users`);

    let hashedCount = 0;

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
      if (!user.password.startsWith('$2a$') && !user.password.startsWith('$2b$')) {
        console.log(` Hashing password for: ${user.email}`);
        
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();
        
        hashedCount++;
      } else {
        console.log(`✅ Password already hashed for: ${user.email}`);
      }
    }

    console.log(`\n Successfully hashed ${hashedCount} password(s)`);
    process.exit(0);
  } catch (error) {
    console.error(' Error:', error.message);
    process.exit(1);
  }
};

hashExistingPasswords();
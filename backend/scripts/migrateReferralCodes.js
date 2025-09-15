import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateReferralCodes() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Fetching all users...');
    const users = await User.find({});
    
    console.log(`Found ${users.length} users to migrate`);
    
    for (let user of users) {
      if (user.fullName) {
        try {
          // Generate username-based referral code
          let baseCode = user.fullName.replace(/\s+/g, '').toLowerCase();
          let referralCode = baseCode;
          let counter = 1;
          
          // Check for uniqueness and add numbers if needed
          while (await User.findOne({ referralCode, _id: { $ne: user._id } })) {
            referralCode = `${baseCode}${counter}`;
            counter++;
          }
          
          // Update user with new referral code
          await User.findByIdAndUpdate(user._id, { referralCode });
          console.log(`Updated user ${user.fullName}: ${user.referralCode} -> ${referralCode}`);
        } catch (error) {
          console.error(`Error updating user ${user.fullName}:`, error);
        }
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateReferralCodes();
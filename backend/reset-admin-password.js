import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, './.env') });

const resetAdminPassword = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Find the active admin user
    const adminUser = await User.findOne({ email: 'doxp@gmail.com', role: 'admin' });
    
    if (!adminUser) {
      console.log('Admin user not found');
      process.exit(1);
    }

    // Reset password to 'admin123'
    adminUser.password = 'admin123';
    await adminUser.save();
    
    console.log('Admin password reset successfully!');
    console.log('Email: doxp@gmail.com');
    console.log('Password: admin123');
    
  } catch (error) {
    console.error('Error resetting password:', error);
  } finally {
    mongoose.connection.close();
  }
};

resetAdminPassword();
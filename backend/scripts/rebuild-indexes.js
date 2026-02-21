import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

// Import models
import User from '../models/User.js';
import WatchedVideo from '../models/WatchedVideo.js';
import PhotoShare from '../models/PhotoShare.js';
import Video from '../models/Video.js';
import Photo from '../models/Photo.js';
import Withdrawal from '../models/Withdrawal.js';
import Transaction from '../models/Transaction.js';
import MultilevelEarnings from '../models/MultilevelEarnings.js';
import BonusTransaction from '../models/BonusTransaction.js';

const rebuildIndexes = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB connected successfully!');
    console.log('\n🔄 Rebuilding indexes...\n');

    // List of models to rebuild indexes
    const models = [
      { name: 'User', model: User },
      { name: 'WatchedVideo', model: WatchedVideo },
      { name: 'PhotoShare', model: PhotoShare },
      { name: 'Video', model: Video },
      { name: 'Photo', model: Photo },
      { name: 'Withdrawal', model: Withdrawal },
      { name: 'Transaction', model: Transaction },
      { name: 'MultilevelEarnings', model: MultilevelEarnings },
      { name: 'BonusTransaction', model: BonusTransaction }
    ];

    // Ensure indexes exist (only creates missing ones)
    for (const { name, model } of models) {
      try {
        // createIndexes() only creates missing indexes, doesn't drop existing ones
        const result = await model.createIndexes();
        console.log(`✓ Ensured indexes for ${name}`);
      } catch (error) {
        console.error(`✗ Error ensuring indexes for ${name}:`, error.message);
      }
    }

    console.log('\n✅ All indexes rebuilt successfully!\n');

    // Verify specific indexes
    console.log('📋 Verifying critical indexes:\n');
    
    const photoshareIndexes = await PhotoShare.collection.getIndexes();
    console.log('PhotoShare indexes:');
    Object.keys(photoshareIndexes).forEach(key => {
      console.log(`  - ${key}:`, photoshareIndexes[key]);
    });

    const watchedvideoIndexes = await WatchedVideo.collection.getIndexes();
    console.log('\nWatchedVideo indexes:');
    Object.keys(watchedvideoIndexes).forEach(key => {
      console.log(`  - ${key}:`, watchedvideoIndexes[key]);
    });

    console.log('\n✅ Index verification complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error rebuilding indexes:', error);
    process.exit(1);
  }
};

rebuildIndexes();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import PhotoShare from '../models/PhotoShare.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

const cleanupDuplicates = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    console.log('MongoDB connected successfully!');

    console.log('\n🔍 Finding duplicate PhotoShares...');
    
    const duplicates = await PhotoShare.aggregate([
      {
        $group: {
          _id: { user: '$user', photo: '$photo' },
          ids: { $push: '$_id' },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);

    if (duplicates.length === 0) {
      console.log('✓ No duplicates found!');
      await mongoose.connection.close();
      process.exit(0);
    }

    console.log(`Found ${duplicates.length} duplicate entries\n`);

    let totalDeleted = 0;

    for (const dup of duplicates) {
      const { user, photo } = dup._id;
      const ids = dup.ids;
      const keepId = ids[0];
      const deleteIds = ids.slice(1);

      console.log(`User ${user} - Photo ${photo}:`);
      console.log(`  Keeping: ${keepId}`);
      console.log(`  Deleting: ${deleteIds.length} duplicate(s)`);

      const result = await PhotoShare.deleteMany({ _id: { $in: deleteIds } });
      totalDeleted += result.deletedCount;
    }

    console.log(`\n✓ Deleted ${totalDeleted} duplicate entries`);

    console.log('\n🔧 Rebuilding unique index...');
    
    await PhotoShare.collection.dropIndex('user_1_photo_1').catch(err => {
      if (err.code !== 27) {
        console.error('Error dropping index:', err.message);
        throw err;
      }
    });

    await PhotoShare.collection.createIndex({ user: 1, photo: 1 }, { unique: true });
    console.log('✓ Unique index recreated successfully');

    console.log('\n✅ Cleanup completed successfully!');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

cleanupDuplicates();

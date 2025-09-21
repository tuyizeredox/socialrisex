import mongoose from 'mongoose';

const photoShareSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  photo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Photo',
    required: true
  },
  platform: {
    type: String,
    required: true,
    enum: ['whatsapp', 'facebook', 'twitter', 'instagram', 'telegram']
  },
  rwfEarned: {
    type: Number,
    default: 50
  },
  isProcessed: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for performance
photoShareSchema.index({ user: 1 });
photoShareSchema.index({ photo: 1 });
photoShareSchema.index({ createdAt: -1 });

// Compound index for user stats
photoShareSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model('PhotoShare', photoShareSchema);
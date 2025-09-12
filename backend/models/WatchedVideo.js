import mongoose from 'mongoose';

const watchedVideoSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  video: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  watchTime: {
    type: Number,
    default: 0
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  completedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Ensure a user can only have one record per video
watchedVideoSchema.index({ user: 1, video: 1 }, { unique: true });

export default mongoose.model('WatchedVideo', watchedVideoSchema);
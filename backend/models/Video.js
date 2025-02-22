import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Video title is required'],
    trim: true
  },
  youtubeUrl: {
    type: String,
    required: [true, 'YouTube URL is required'],
    trim: true
  },
  youtubeId: {
    type: String,
    trim: true
  },
  pointsReward: {
    type: Number,
    required: [true, 'Points reward is required'],
    default: 1000,
    min: 0
  },
  minimumWatchTime: {
    type: Number,
    required: [true, 'Minimum watch time is required'],
    default: 60,
    min: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add virtual for watchedBy
videoSchema.virtual('watchedBy', {
  ref: 'WatchedVideo',
  localField: '_id',
  foreignField: 'video'
});

// Pre-save middleware to ensure youtubeId is set
videoSchema.pre('save', function(next) {
  if (!this.youtubeId && this.youtubeUrl) {
    try {
      const urlObj = new URL(this.youtubeUrl);
      if (urlObj.hostname.includes('youtube.com')) {
        this.youtubeId = urlObj.searchParams.get('v');
      } else if (urlObj.hostname.includes('youtu.be')) {
        this.youtubeId = urlObj.pathname.slice(1);
      }
    } catch (error) {
      console.error('Error parsing YouTube URL:', error);
    }
  }
  next();
});

export default mongoose.model('Video', videoSchema);
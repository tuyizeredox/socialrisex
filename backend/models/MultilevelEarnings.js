import mongoose from 'mongoose';

const multilevelEarningsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  level1: {
    count: {
      type: Number,
      default: 0
    },
    earnings: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  level2: {
    count: {
      type: Number,
      default: 0
    },
    earnings: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  level3: {
    count: {
      type: Number,
      default: 0
    },
    earnings: {
      type: Number,
      default: 0
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  lastCalculated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
multilevelEarningsSchema.index({ user: 1 });
multilevelEarningsSchema.index({ totalEarnings: -1 });
multilevelEarningsSchema.index({ lastCalculated: -1 });

const MultilevelEarnings = mongoose.model('MultilevelEarnings', multilevelEarningsSchema);

export default MultilevelEarnings;

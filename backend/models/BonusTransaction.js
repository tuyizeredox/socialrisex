import mongoose from 'mongoose';

const bonusTransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Bonus amount is required'],
    min: [1, 'Bonus amount must be at least 1 RWF']
  },
  type: {
    type: String,
    enum: ['admin_bonus', 'referral_bonus', 'special_promotion'],
    default: 'admin_bonus'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    trim: true
  },
  // Track if this bonus affects withdrawal eligibility
  affectsWithdrawal: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for efficient queries
bonusTransactionSchema.index({ user: 1, addedAt: -1 });
bonusTransactionSchema.index({ addedBy: 1 });
bonusTransactionSchema.index({ status: 1 });
bonusTransactionSchema.index({ type: 1 });

// Virtual for formatted amount
bonusTransactionSchema.virtual('formattedAmount').get(function() {
  return `RWF ${this.amount.toLocaleString()}`;
});

const BonusTransaction = mongoose.model('BonusTransaction', bonusTransactionSchema);
export default BonusTransaction;

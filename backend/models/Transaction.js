import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    trim: true,
    uppercase: true
  },
  amount: {
    type: Number,
    default: 8000 // Activation fee amount
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'duplicate'],
    default: 'pending'
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    trim: true
  },
  isDuplicate: {
    type: Boolean,
    default: false
  },
  duplicateCount: {
    type: Number,
    default: 0
  },
  // Metadata for admin verification
  metadata: {
    ipAddress: String,
    userAgent: String,
    previousAttempts: Number
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index for fast duplicate detection
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1, submittedAt: -1 });
transactionSchema.index({ user: 1 });

// Virtual for processing time
transactionSchema.virtual('processingTime').get(function() {
  if (this.processedAt && this.submittedAt) {
    return Math.round((this.processedAt - this.submittedAt) / (1000 * 60)); // minutes
  }
  return null;
});

// Check for duplicate transactions before saving
transactionSchema.pre('save', async function(next) {
  if (this.isNew) {
    const existingTransaction = await mongoose.model('Transaction').findOne({
      transactionId: this.transactionId
    });
    
    if (existingTransaction) {
      this.isDuplicate = true;
      this.duplicateCount = await mongoose.model('Transaction').countDocuments({
        transactionId: this.transactionId
      });
    }
  }
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);
export default Transaction;
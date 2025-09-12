import mongoose from 'mongoose';

const withdrawalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [5000, 'Minimum withdrawal amount is 5,000 RWF']
  },
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['momo', 'bank'],
    default: 'momo'
  },
  accountDetails: {
    accountName: {
      type: String,
      required: [true, 'Account name is required']
    },
    accountNumber: {
      type: String,
      required: [true, 'Account number is required']
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  notes: {
    type: String
  },
  processedAt: {
    type: Date
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Add index for faster queries
withdrawalSchema.index({ status: 1, createdAt: -1 });
withdrawalSchema.index({ user: 1, createdAt: -1 });

// Virtual for formatted account details
withdrawalSchema.virtual('formattedAccountDetails').get(function() {
  return `${this.accountDetails.accountName}\n${this.accountDetails.accountNumber}`;
});

const Withdrawal = mongoose.model('Withdrawal', withdrawalSchema);

export default Withdrawal;
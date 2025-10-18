import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email']
  },
  mobileNumber: {
    type: String,
    required: [true, 'Please provide your mobile number'],
    match: [/^\+?[1-9]\d{1,14}$/, 'Please provide a valid mobile number'],
    unique: true
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: [6, 'Password must be at least 6 characters']
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: false
  },
  earnings: {
    type: Number,
    default: 0
  },
  bonusEarnings: {
    type: Number,
    default: 0
  },
  points: {
    type: Number,
    default: 0
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  referralCount: {
    type: Number,
    default: 0
  },
  paymentTransactionId: {
    type: String,
    default: null
  },
  welcomeBonusGiven: {
    type: Boolean,
    default: false
  },
  activatedAt: {
    type: Date,
    default: null
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  videosWatched: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    watchedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual field for referrals
userSchema.virtual('referrals', {
  ref: 'User',
  localField: '_id',
  foreignField: 'referredBy'
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate JWT Token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Match password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate referral code based on username
userSchema.pre('save', async function(next) {
  if (!this.referralCode && this.fullName) {
    try {
      // Use fullName as referral code, removing spaces and making URL-friendly
      let baseCode = this.fullName.replace(/\s+/g, '').toLowerCase();
      let referralCode = baseCode;
      let counter = 1;
      
      // Check for uniqueness and add numbers if needed
      while (await mongoose.model('User').findOne({ referralCode, _id: { $ne: this._id } })) {
        referralCode = `${baseCode}${counter}`;
        counter++;
      }
      
      this.referralCode = referralCode;
    } catch (error) {
      return next(error);
    }
  }
  next();
});

const User = mongoose.model('User', userSchema);
export default User;
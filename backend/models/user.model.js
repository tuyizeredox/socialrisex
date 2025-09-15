const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  referralCode: {
    type: String,
    unique: true
  },
  referredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: false
  },
  points: {
    type: Number,
    default: 0
  },
  earnings: {
    type: Number,
    default: 0
  },
  videosWatched: [{
    videoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video'
    },
    watchedAt: Date
  }],
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed'],
    default: 'pending'
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Generate referral code based on username if not exists
    if (!this.referralCode && this.name) {
      // Use name as referral code, removing spaces and making URL-friendly
      let baseCode = this.name.replace(/\s+/g, '').toLowerCase();
      let referralCode = baseCode;
      let counter = 1;
      
      // Check for uniqueness and add numbers if needed
      while (await mongoose.model('User').findOne({ referralCode, _id: { $ne: this._id } })) {
        referralCode = `${baseCode}${counter}`;
        counter++;
      }
      
      this.referralCode = referralCode;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 
import User from '../models/User.js';
import Transaction from '../models/Transaction.js';
import ErrorResponse from '../utils/errorResponse.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

export const register = async (req, res, next) => {
  try {
    const { fullName, email, password, mobileNumber, referralCode } = req.body;

    // Check if user exists with email or mobile
    let userExists = await User.findOne({ 
      $or: [
        { email },
        { mobileNumber }
      ]
    });

    if (userExists) {
      if (userExists.email === email) {
        throw new ErrorResponse('Email already registered', 400);
      }
      throw new ErrorResponse('Mobile number already registered', 400);
    }

    // Check if username (fullName) already exists
    const existingName = await User.findOne({ 
      fullName: { $regex: new RegExp(`^${fullName.trim()}$`, 'i') }
    });

    if (existingName) {
      throw new ErrorResponse('This name already exists. Please use another name.', 400);
    }

    // Find referrer if referral code provided
    let referredBy;
    if (referralCode) {
      // Try finding by referralCode first (username-based), then by fullName
      referredBy = await User.findOne({ 
        $or: [
          { referralCode: referralCode.toLowerCase() },
          { fullName: { $regex: new RegExp(`^${referralCode}$`, 'i') } }
        ]
      });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      mobileNumber,
      password,
      referredBy: referredBy?._id
      // referralCode will be auto-generated from fullName in the pre-save hook
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { fullName, password } = req.body;

    // Validation
    if (!fullName || !password) {
      throw new ErrorResponse('Please provide username and password', 400);
    }

    // Find user - case insensitive search for fullName
    const user = await User.findOne({
      fullName: { $regex: new RegExp(`^${fullName}$`, 'i') }
    }).select('+password +fullName +email +role +isActive +referralCode +referralCount +earnings +points +mobileNumber');

    if (!user) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Generate token
    const token = user.getSignedJwtToken();

    // Remove sensitive data
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.__v;

    // Send response
    res.status(200).json({
      success: true,
      token,
      user: userObject
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ verificationToken: token });
    if (!user) {
      throw new ErrorResponse('Invalid verification token', 400);
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const resendVerification = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    if (user.isVerified) {
      throw new ErrorResponse('Email already verified', 400);
    }

    // Generate new verification token
    const verificationToken = crypto.randomBytes(20).toString('hex');
    user.verificationToken = verificationToken;
    await user.save();

    // Send verification email
    const verificationUrl = `${req.protocol}://${req.get('host')}/verify-email?token=${verificationToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message: `Please click the link to verify your email: ${verificationUrl}`
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent'
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send reset email
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password?token=${resetToken}`;
    await sendEmail({
      email: user.email,
      subject: 'Password Reset',
      message: `Please click the link to reset your password: ${resetUrl}`
    });

    res.status(200).json({
      success: true,
      message: 'Password reset email sent'
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const resetPasswordToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      throw new ErrorResponse('Invalid or expired reset token', 400);
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

export const activateAccount = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    if (user.isActive) {
      throw new ErrorResponse('Account is already activated', 400);
    }

    // Update user activation status
    user.isActive = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Account activated successfully',
      data: {
        isActive: true
      }
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user._id;

    if (!transactionId) {
      throw new ErrorResponse('Transaction ID is required', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    if (user.isActive) {
      throw new ErrorResponse('Account is already activated', 400);
    }

    // Basic validation for MTN MoMo transaction ID format
    const mtnPattern = /^MP\d{6}\.\d{4}\.[\w\d]+$/i;
    const airtelPattern = /^[\w\d]{8,20}$/i;

    if (!mtnPattern.test(transactionId) && !airtelPattern.test(transactionId)) {
      throw new ErrorResponse('Invalid transaction ID format', 400);
    }

    // In a real implementation, you would verify the transaction with the payment provider
    // For now, we'll simulate successful verification for valid format transaction IDs
    
    // Store transaction ID for record keeping
    user.paymentTransactionId = transactionId;
    user.isActive = true;
    user.activatedAt = new Date();
    await user.save();

    // Give welcome bonus
    if (!user.welcomeBonusGiven) {
      user.points += 3000;
      user.welcomeBonusGiven = true;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and account activated successfully!',
      data: {
        isActive: true,
        transactionId: transactionId,
        welcomeBonus: user.welcomeBonusGiven ? 3000 : 0
      }
    });

  } catch (error) {
    next(error);
  }
};

export const submitTransaction = async (req, res, next) => {
  try {
    const { transactionId } = req.body;
    const userId = req.user._id;

    if (!transactionId || !transactionId.trim()) {
      throw new ErrorResponse('Transaction ID is required', 400);
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    if (user.isActive) {
      throw new ErrorResponse('Account is already activated', 400);
    }

    // Clean and format transaction ID
    const cleanTransactionId = transactionId.trim().toUpperCase();

    // Basic validation for transaction ID (minimum requirements)
    if (cleanTransactionId.length < 8 || cleanTransactionId.length > 30) {
      throw new ErrorResponse('Transaction ID must be between 8 and 30 characters long', 400);
    }

    // Check for valid characters (alphanumeric and common separators)
    const validPattern = /^[A-Z0-9._-]+$/;
    if (!validPattern.test(cleanTransactionId)) {
      throw new ErrorResponse('Transaction ID contains invalid characters. Only letters, numbers, dots, underscores, and hyphens are allowed', 400);
    }

    // Check if user has already submitted a pending transaction
    const existingPendingTransaction = await Transaction.findOne({
      user: userId,
      status: 'pending'
    });

    if (existingPendingTransaction) {
      throw new ErrorResponse('You already have a pending transaction. Please wait for admin approval.', 400);
    }

    // Create transaction record for admin approval
    const transaction = await Transaction.create({
      user: userId,
      transactionId: cleanTransactionId,
      amount: 8000,
      metadata: {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        previousAttempts: await Transaction.countDocuments({ user: userId })
      }
    });

    res.status(200).json({
      success: true,
      message: 'Transaction ID submitted successfully. Your account activation is pending admin approval.',
      data: {
        transactionId: cleanTransactionId,
        submittedAt: transaction.submittedAt,
        status: 'pending'
      }
    });

  } catch (error) {
    next(error);
  }
};



// Helper function to send token response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  res.status(statusCode).json({
    success: true,
    token,
    user: {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      isActive: user.isActive,
      earnings: user.earnings,
      points: user.points,
      referralCode: user.referralCode
    }
  });
};
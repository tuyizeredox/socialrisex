import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import sendEmail from '../utils/sendEmail.js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs'; // Add this import at the top with other imports

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

    // Find referrer if referral code provided
    let referredBy;
    if (referralCode) {
      referredBy = await User.findOne({ referralCode });
    }

    // Create user
    const user = await User.create({
      fullName,
      email,
      mobileNumber,
      password,
      referredBy: referredBy?._id,
      referralCode: crypto.randomBytes(3).toString('hex').toUpperCase()
    });

    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { fullName, password } = req.body;

    if (!fullName || !password) {
      throw new ErrorResponse('Please provide username and password', 400);
    }

    // Modified query to handle projection properly
    const user = await User.findOne({ fullName })
      .select('+password +fullName +email +role +isActive +referralCode +referralCount +earnings +points +mobileNumber');
    
    if (!user) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Use the matchPassword method from the User model instead of direct bcrypt compare
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      throw new ErrorResponse('Invalid credentials', 401);
    }

    // Generate token using the model method
    const token = user.getSignedJwtToken();

    // Convert to plain object and remove sensitive data
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
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { calculateMultilevelReferralEarnings } from '../utils/referralCalculations.js';

// @desc    Create withdrawal request
// @route   POST /api/withdrawals
// @access  Private
// In your createWithdrawal controller
export const createWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMethod, accountDetails, isFirstWithdrawal } = req.body;
    const userId = req.user._id;

    // Get user's current balance
    const user = await User.findById(userId);
    
    // Skip balance check for first-time withdrawal
    if (!isFirstWithdrawal && user.balance < amount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance'
      });
    }

    // Create new withdrawal
    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      paymentMethod,
      accountDetails,
      status: 'pending'
    });

    await withdrawal.save();

    // Update user's balance
    if (!isFirstWithdrawal) {
      user.balance -= amount;
      await user.save();
    }

    res.status(201).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error processing withdrawal request',
      error: error.message
    });
  }
};

// @desc    Get user's withdrawals
// @route   GET /api/withdrawals
// @access  Private
export const getUserWithdrawals = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .populate('user', 'name email earnings')
      .sort('-createdAt');

    // Get total pending withdrawals
    const pendingAmount = await Withdrawal.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get total approved withdrawals
    const withdrawnAmount = await Withdrawal.aggregate([
      {
        $match: {
          user: req.user._id,
          status: 'approved'
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const user = await User.findById(req.user._id);
    
    // Calculate multilevel referral earnings
    const referralData = await calculateMultilevelReferralEarnings(req.user._id);
    const totalReferralEarnings = referralData.totalEarnings;
    
    // Calculate available balance
    const totalWithdrawn = withdrawnAmount[0]?.total || 0;
    const pendingWithdrawals = pendingAmount[0]?.total || 0;
    const availableBalance = totalReferralEarnings - totalWithdrawn - pendingWithdrawals;

    res.status(200).json({
      success: true,
      data: {
        withdrawals,
        totalReferralEarnings,
        totalWithdrawn,
        pendingWithdrawals,
        availableBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pending withdrawals (admin)
// @route   GET /api/admin/withdrawals/pending
// @access  Admin
export const getPendingWithdrawals = async (req, res, next) => {
  try {
    // Get pending withdrawals with user details
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate({
        path: 'user',
        select: 'name email earnings referralEarnings',
        model: User
      })
      .select('amount status accountDetails paymentMethod createdAt')
      .sort('-createdAt')
      .lean();

    // Calculate total earnings for each withdrawal
    const withdrawalsWithTotalEarnings = withdrawals.map(withdrawal => {
      const user = withdrawal.user || {};
      return {
        ...withdrawal,
        user: {
          ...user,
          earnings: (user.earnings || 0) + (user.referralEarnings || 0)
        }
      };
    });

    res.status(200).json({
      success: true,
      count: withdrawalsWithTotalEarnings.length,
      data: withdrawalsWithTotalEarnings
    });
  } catch (error) {
    console.error('Error fetching pending withdrawals:', error);
    next(new ErrorResponse('Failed to fetch withdrawals', 500));
  }
};

// @desc    Get all withdrawals (admin)
// @route   GET /api/admin/withdrawals
// @access  Admin
export const getAllWithdrawals = async (req, res, next) => {
  try {
    // Get all withdrawals with user details
    const withdrawals = await Withdrawal.find()
      .populate({
        path: 'user',
        select: 'name email earnings referralEarnings',
        model: User
      })
      .select('amount status accountDetails paymentMethod createdAt')
      .sort('-createdAt')
      .lean();

    // Calculate total earnings for each withdrawal
    const withdrawalsWithTotalEarnings = withdrawals.map(withdrawal => {
      const user = withdrawal.user || {};
      return {
        ...withdrawal,
        user: {
          ...user,
          earnings: (user.earnings || 0) + (user.referralEarnings || 0)
        }
      };
    });

    res.status(200).json({
      success: true,
      count: withdrawalsWithTotalEarnings.length,
      data: withdrawalsWithTotalEarnings
    });
  } catch (error) {
    console.error('Error fetching all withdrawals:', error);
    next(new ErrorResponse('Failed to fetch withdrawals', 500));
  }
};

// @desc    Process withdrawal request (admin)
// @route   PUT /api/admin/withdrawals/:id
// @access  Admin
export const processWithdrawal = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id)
      .populate('user', 'name email earnings referrals');

    if (!withdrawal) {
      throw new ErrorResponse('Withdrawal request not found', 404);
    }

    // Only allow processing pending withdrawals
    if (withdrawal.status !== 'pending') {
      throw new ErrorResponse('This withdrawal has already been processed', 400);
    }

    // Get user
    const user = await User.findById(withdrawal.user._id);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    // Calculate multilevel referral earnings
    const referralData = await calculateMultilevelReferralEarnings(withdrawal.user._id);
    const totalReferralEarnings = referralData.totalEarnings;

    // Get total approved withdrawals
    const withdrawnAmount = await Withdrawal.aggregate([
      {
        $match: {
          user: user._id,
          status: 'approved',
          _id: { $ne: withdrawal._id } // Exclude current withdrawal
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Get pending withdrawals (excluding current one)
    const pendingAmount = await Withdrawal.aggregate([
      {
        $match: {
          user: user._id,
          status: 'pending',
          _id: { $ne: withdrawal._id }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    const totalWithdrawn = withdrawnAmount[0]?.total || 0;
    const pendingWithdrawals = pendingAmount[0]?.total || 0;
    const availableBalance = totalReferralEarnings - totalWithdrawn - pendingWithdrawals;

    // If approving, check if user has sufficient balance
    if (status === 'approved' && withdrawal.amount > availableBalance) {
      throw new ErrorResponse('User has insufficient balance', 400);
    }

    // Update withdrawal status
    withdrawal.status = status;
    withdrawal.notes = notes;
    withdrawal.processedAt = Date.now();
    withdrawal.processedBy = req.user._id;
    await withdrawal.save();

    // Populate updated withdrawal
    await withdrawal.populate('user', 'name email');

    res.status(200).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import WatchedVideo from '../models/WatchedVideo.js';
import PhotoShare from '../models/PhotoShare.js';
import ErrorResponse from '../utils/errorResponse.js';
import { calculateMultilevelReferralEarnings } from '../utils/referralCalculations.js';

const WITHDRAWAL_FEE = 1500; // RWF

// @desc    Create withdrawal request
// @route   POST /api/withdrawals
// @access  Private
// In your createWithdrawal controller
export const createWithdrawal = async (req, res) => {
  try {
    const { amount, paymentMethod, accountDetails, isFirstWithdrawal } = req.body;
    const userId = req.user._id;

    // Debug logging
    console.log('Create withdrawal request body:', req.body);
    console.log('Extracted values:', { amount, paymentMethod, accountDetails, isFirstWithdrawal });

    // Validate required fields
    if (!amount || !paymentMethod || !accountDetails) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: amount, paymentMethod, and accountDetails are required'
      });
    }

    if (!accountDetails.accountName || !accountDetails.accountNumber) {
      return res.status(400).json({
        success: false,
        message: 'Account name and account number are required'
      });
    }

    // Get user's current balance
    const user = await User.findById(userId);
    
    // Skip balance check for first-time withdrawal
    if (!isFirstWithdrawal) {
      // Withdrawal is only for referral and bonus earnings (NOT video/photo earnings)
      const multilevelData = await calculateMultilevelReferralEarnings(userId);
      const referralEarnings = multilevelData.totalEarnings;
      const bonusEarnings = user.bonusEarnings || 0;
      
      // Total earnings from referrals and bonuses only (but NOT welcome bonus for withdrawal)
      const totalEarnings = referralEarnings + bonusEarnings;

      // Get total approved withdrawals
      const withdrawnAmount = await Withdrawal.aggregate([
        {
          $match: {
            user: userId,
            status: 'approved'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$total', '$amount'] } }
          }
        }
      ]);

      // Get pending withdrawals
      const pendingAmount = await Withdrawal.aggregate([
        {
          $match: {
            user: userId,
            status: 'pending'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: { $ifNull: ['$total', '$amount'] } }
          }
        }
      ]);

      const totalWithdrawn = withdrawnAmount[0]?.total || 0;
      const pendingWithdrawals = pendingAmount[0]?.total || 0;
      const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;

      const totalDeduction = Number(amount) + WITHDRAWAL_FEE;

      if (totalDeduction > availableBalance) {
        return res.status(400).json({
          success: false,
          message: `Insufficient balance. Withdrawal plus fee (RWF ${WITHDRAWAL_FEE}) exceed your available balance.`
        });
      }
    }

    // Create new withdrawal (store fee and total deduction)
    const withdrawal = new Withdrawal({
      user: userId,
      amount,
      fee: WITHDRAWAL_FEE,
      total: Number(amount) + WITHDRAWAL_FEE,
      paymentMethod,
      accountDetails,
      status: 'pending'
    });

    await withdrawal.save();

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
          total: { $sum: { $ifNull: ['$total', '$amount'] } }
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
          total: { $sum: { $ifNull: ['$total', '$amount'] } }
        }
      }
    ]);

    const user = await User.findById(req.user._id);
    
    // Calculate fresh referral earnings
    const multilevelData = await calculateMultilevelReferralEarnings(req.user._id);
    const referralEarnings = multilevelData.totalEarnings;
    const bonusEarnings = user.bonusEarnings || 0;
    
    // Include bonus and referral earnings in total earnings (but NOT welcome bonus for withdrawal)
    const welcomeBonus = 3000;
    const totalEarnings = referralEarnings + bonusEarnings;
    const totalEarningsWithWelcome = totalEarnings + welcomeBonus; // For display only
    
    // Calculate available balance (without welcome bonus)
    const totalWithdrawn = withdrawnAmount[0]?.total || 0;
    const pendingWithdrawals = pendingAmount[0]?.total || 0;
    const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;

    res.status(200).json({
      success: true,
      data: {
        withdrawals,
        totalReferralEarnings: totalEarningsWithWelcome, // For display (includes welcome bonus)
        totalWithdrawn,
        pendingWithdrawals,
        availableBalance, // Actual withdrawable amount (without welcome bonus)
        bonusEarnings: user.bonusEarnings || 0,
        welcomeBonus: welcomeBonus,
        withdrawableEarnings: totalEarnings // Actual earnings that can be withdrawn
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
        select: 'name email earnings _id',
        model: User
      })
      .select('amount status accountDetails paymentMethod createdAt')
      .sort('-createdAt')
      .lean();

    // Calculate total earnings for each withdrawal with fresh referral calculations
    const withdrawalsWithTotalEarnings = await Promise.all(withdrawals.map(async (withdrawal) => {
      const user = withdrawal.user || {};
      const multilevelData = await calculateMultilevelReferralEarnings(user._id);
      const referralEarnings = multilevelData.totalEarnings;
      return {
        ...withdrawal,
        user: {
          ...user,
          earnings: (user.earnings || 0) + referralEarnings
        }
      };
    }));

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
        select: 'name email earnings _id',
        model: User
      })
      .select('amount status accountDetails paymentMethod createdAt')
      .sort('-createdAt')
      .lean();

    // Calculate total earnings for each withdrawal with fresh referral calculations
    const withdrawalsWithTotalEarnings = await Promise.all(withdrawals.map(async (withdrawal) => {
      const user = withdrawal.user || {};
      const multilevelData = await calculateMultilevelReferralEarnings(user._id);
      const referralEarnings = multilevelData.totalEarnings;
      return {
        ...withdrawal,
        user: {
          ...user,
          earnings: (user.earnings || 0) + referralEarnings
        }
      };
    }));

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

    // Calculate fresh referral earnings
    const multilevelData = await calculateMultilevelReferralEarnings(withdrawal.user._id);
    const referralEarnings = multilevelData.totalEarnings;
    const bonusEarnings = user.bonusEarnings || 0;

    // Include bonus and referral earnings in total earnings (but NOT welcome bonus for withdrawal)
    const totalEarnings = referralEarnings + bonusEarnings;

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
          total: { $sum: { $ifNull: ['$total', '$amount'] } }
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
          total: { $sum: { $ifNull: ['$total', '$amount'] } }
        }
      }
    ]);

    const totalWithdrawn = withdrawnAmount[0]?.total || 0;
    const pendingWithdrawals = pendingAmount[0]?.total || 0;
    const availableBalance = totalEarnings - totalWithdrawn - pendingWithdrawals;

    // Debug logging for balance calculation
    console.log('Withdrawal Balance Debug:', {
      userId: user._id,
      withdrawalAmount: withdrawal.amount,
      totalReferralEarnings,
      bonusEarnings: user.bonusEarnings || 0,
      totalEarnings,
      totalWithdrawn,
      pendingWithdrawals,
      availableBalance
    });

    // If approving, check if user has sufficient balance
    if (status === 'approved' && withdrawal.total > availableBalance) {
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

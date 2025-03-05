import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// @desc    Create withdrawal request
// @route   POST /api/withdrawals
// @access  Private
export const createWithdrawal = async (req, res, next) => {
  try {
    const { amount, paymentMethod, accountDetails } = req.body;
    const userId = req.user._id;

    // Fetch user
    const user = await User.findById(userId);
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Get total pending withdrawals
    const pendingWithdrawals = await Withdrawal.aggregate([
      {
        $match: {
          user: user._id,
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

    const pendingAmount = pendingWithdrawals.length > 0 ? pendingWithdrawals[0].total : 0;
    const availableBalance = user.earnings + (user.referralEarnings || 0) - pendingAmount;

    if (availableBalance < amount) {
      return next(new ErrorResponse('Insufficient balance', 400));
    }

    // Check minimum withdrawal amount
    if (amount < 5000) {
      return next(new ErrorResponse('Minimum withdrawal amount is 5,000 RWF', 400));
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: userId,
      amount,
      paymentMethod,
      accountDetails,
      status: 'pending'
    });

    await withdrawal.populate('user', 'name email earnings referralEarnings');

    res.status(201).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's withdrawals
// @route   GET /api/withdrawals
// @access  Private
export const getUserWithdrawals = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('referrals');
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    const withdrawals = await Withdrawal.find({ user: req.user._id })
      .populate('user', 'name email earnings referralEarnings')
      .sort('-createdAt');

    const pendingAmount = await Withdrawal.aggregate([
      { $match: { user: req.user._id, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const withdrawnAmount = await Withdrawal.aggregate([
      { $match: { user: req.user._id, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const activeReferrals = user.referrals.filter(ref => ref.isActive).length;
    const totalReferralEarnings = activeReferrals * 2800;

    const totalWithdrawn = withdrawnAmount[0]?.total || 0;
    const totalPending = pendingAmount[0]?.total || 0;
    const availableBalance = user.earnings + totalReferralEarnings - totalPending;

    res.status(200).json({
      success: true,
      data: {
        withdrawals,
        totalReferralEarnings,
        totalWithdrawn,
        pendingWithdrawals: totalPending,
        availableBalance
      }
    });
  } catch (error) {
    next(error);
  }
};

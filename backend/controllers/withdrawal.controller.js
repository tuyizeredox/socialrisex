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

    // Check if user has sufficient balance
    const user = await User.findById(userId);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
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
const availableBalance = (user.earnings || 0) + (user.referralEarnings || 0) - pendingAmount;

if (availableBalance < amount) {
  throw new ErrorResponse('Insufficient balance', 400);
}


    // Check minimum withdrawal amount
    if (amount < 5000) {
      throw new ErrorResponse('Minimum withdrawal amount is 5,000 RWF', 400);
    }

    // Create withdrawal request
    const withdrawal = await Withdrawal.create({
      user: userId,
      amount,
      paymentMethod,
      accountDetails
    });

    // Populate user data
    await withdrawal.populate('user', 'name email earnings');

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

    const user = await User.findById(req.user._id).populate('referrals');
    
    // Calculate total referral earnings (2800 RWF per active referral)
    const activeReferrals = user.referrals.filter(ref => ref.isActive).length;
    const totalReferralEarnings = activeReferrals * 2800;
    
    // Calculate available balance
    const totalWithdrawn = withdrawnAmount[0]?.total || 0;
    const pendingWithdrawals = pendingAmount[0]?.total || 0;
    const availableBalance = user.earnings + (user.referralEarnings || 0) - pendingAmount;


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
      .populate('user', 'name email earnings');

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

    // If approving, check if user still has sufficient balance
if (status === 'approved') {
  const userBalance = user.earnings + (user.referralEarnings || 0);
  if (userBalance < withdrawal.amount) {
    throw new ErrorResponse('User has insufficient balance', 400);
  }
  user.earnings -= withdrawal.amount;
  await user.save();
}


    // Update withdrawal status
    withdrawal.status = status;
    withdrawal.notes = notes;
    withdrawal.processedAt = Date.now();
    withdrawal.processedBy = req.user._id;
    await withdrawal.save();

    // Populate updated withdrawal
    await withdrawal.populate('user', 'name email earnings');

    res.status(200).json({
      success: true,
      data: withdrawal
    });
  } catch (error) {
    next(error);
  }
};

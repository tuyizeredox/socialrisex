import express from 'express';
import Withdrawal from '../models/Withdrawal.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

const router = express.Router();

// @desc    Create withdrawal request
// @route   POST /api/withdrawals
// @access  Private
export const createWithdrawal = async (req, res, next) => {
  try {
    const { amount, paymentMethod, accountDetails } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) return next(new ErrorResponse('User not found', 404));

    const pendingWithdrawals = await Withdrawal.aggregate([
      { $match: { user: user._id, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingAmount = pendingWithdrawals.length > 0 ? pendingWithdrawals[0].total : 0;
    const availableBalance = (user.earnings || 0) - pendingAmount;

    if (amount < 5000) {
      return next(new ErrorResponse('Minimum withdrawal amount is 5,000 RWF', 400));
    }

    if (availableBalance < amount) {
      return next(new ErrorResponse('Insufficient balance', 400));
    }

    const withdrawal = await Withdrawal.create({ user: userId, amount, paymentMethod, accountDetails });
    await withdrawal.populate('user', 'name email earnings');

    res.status(201).json({ success: true, data: withdrawal });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's withdrawals
// @route   GET /api/withdrawals
// @access  Private
export const getUserWithdrawals = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const withdrawals = await Withdrawal.find({ user: userId })
      .populate('user', 'name email earnings')
      .sort('-createdAt');

    const pendingAmount = await Withdrawal.aggregate([
      { $match: { user: userId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const withdrawnAmount = await Withdrawal.aggregate([
      { $match: { user: userId, status: 'approved' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const availableBalance = (req.user.earnings || 0) - (pendingAmount[0]?.total || 0);

    res.status(200).json({
      success: true,
      data: { withdrawals, totalWithdrawn: withdrawnAmount[0]?.total || 0, pendingWithdrawals: pendingAmount[0]?.total || 0, availableBalance }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Process withdrawal request (admin)
// @route   PUT /api/admin/withdrawals/:id
// @access  Admin
export const processWithdrawal = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const withdrawal = await Withdrawal.findById(req.params.id).populate('user', 'name email earnings');

    if (!withdrawal) return next(new ErrorResponse('Withdrawal request not found', 404));
    if (withdrawal.status !== 'pending') return next(new ErrorResponse('This withdrawal has already been processed', 400));

    const user = await User.findById(withdrawal.user._id);
    if (!user) return next(new ErrorResponse('User not found', 404));

    if (status === 'approved') {
      user.earnings -= withdrawal.amount;
      await user.save();
    }

    withdrawal.status = status;
    withdrawal.notes = notes;
    withdrawal.processedAt = Date.now();
    withdrawal.processedBy = req.user._id;
    await withdrawal.save();

    res.status(200).json({ success: true, data: withdrawal });
  } catch (error) {
    next(error);
  }
};

export default router;

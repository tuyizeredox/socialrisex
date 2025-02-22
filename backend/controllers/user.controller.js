import User from '../models/User.js';

import jwt from 'jsonwebtoken';

import bcrypt from 'bcryptjs';

import ErrorResponse from '../utils/errorResponse.js';

import Video from '../models/Video.js';

import Withdrawal from '../models/Withdrawal.js';

import WatchedVideo from '../models/WatchedVideo.js'; // Add this import

// Get user profile
export const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }
    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: req.body },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    next(error);
  }
};

// Get user stats
export const getUserStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    const watchedVideos = await WatchedVideo.find({ user: userId })
      .populate('video', 'pointsReward');
    
    const videoPoints = watchedVideos.reduce((total, watch) => 
      total + (watch.pointsEarned || 0), 0);
    
    const referralCount = await User.countDocuments({ referredBy: userId });
    const activeReferrals = await User.countDocuments({ 
      referredBy: userId,
      isActive: true 
    });

    const welcomeBonus = 3000;
    const totalPoints = videoPoints + welcomeBonus;
    const referralEarnings = activeReferrals * 2800;

    res.status(200).json({
      success: true,
      data: {
        points: totalPoints,
        videoPoints,
        welcomeBonus,
        earnings: referralEarnings,
        referrals: referralCount,
        activeReferrals,
        videosWatched: watchedVideos.length
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's watched videos
export const getUserWatchHistory = async (req, res, next) => {
  try {
    const watchedVideos = await WatchedVideo.find({ user: req.user._id })
      .populate('video')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: watchedVideos
    });
  } catch (error) {
    next(error);
  }
};

// Get user's referrals with detailed info
export const getUserReferrals = async (req, res, next) => {
  try {
    const referrals = await User.find({ referredBy: req.user._id })
      .select('fullName email isActive createdAt')
      .sort('-createdAt');

    const stats = {
      total: referrals.length,
      active: referrals.filter(ref => ref.isActive).length,
      earnings: referrals.filter(ref => ref.isActive).length * 2800
    };

    res.status(200).json({
      success: true,
      data: {
        referrals,
        stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get referral info (summary)
export const getUserReferralInfo = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    const referralLink = `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`;
    const totalReferrals = await User.countDocuments({ referredBy: req.user._id });
    const activeReferrals = await User.countDocuments({ 
      referredBy: req.user._id,
      isActive: true 
    });

    res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink,
        totalReferrals,
        activeReferrals,
        earnings: activeReferrals * 2800
      }
    });
  } catch (error) {
    next(error);
  }
};

// Activate account




// Get user activities

export const getUserActivities = async (req, res, next) => {

  try {

    const activities = await User.findById(req.user._id)

      .select('videosWatched')

      .populate('videosWatched.videoId', 'title');



    res.status(200).json(activities);

  } catch (error) {

    next(error);

  }

};



// Get user stats

export const getStats = async (req, res, next) => {

  try {

    const videosWatched = await Video.countDocuments({

      'watchedBy.user': req.user._id,

      'watchedBy.completedAt': { $exists: true }

    });



    // Get referrals and calculate earnings

    const referrals = await User.find({ referredBy: req.user._id });

    const activeReferrals = referrals.filter(ref => ref.isActive);

    const referralEarnings = activeReferrals.length * 2800; // 2800 RWF per active referral



    // Calculate total earnings (referral earnings + other earnings)

    const totalEarnings = referralEarnings + req.user.earnings;



    // Get recent activity and points trend

    const now = new Date();

    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const fourteenDaysAgo = new Date(now - 14 * 24 * 60 * 60 * 1000);



    const recentVideos = await Video.find({

      'watchedBy.user': req.user._id,

      'watchedBy.completedAt': { $gte: sevenDaysAgo }

    });



    const previousVideos = await Video.find({

      'watchedBy.user': req.user._id,

      'watchedBy.completedAt': {

        $gte: fourteenDaysAgo,

        $lt: sevenDaysAgo

      }

    });



    const recentPoints = recentVideos.reduce((sum, video) => sum + video.pointsReward, 0);

    const previousPoints = previousVideos.reduce((sum, video) => sum + video.pointsReward, 0);

    

    const pointsTrend = previousPoints === 0 

      ? 100 

      : ((recentPoints - previousPoints) / previousPoints) * 100;



    res.status(200).json({

      earnings: totalEarnings, // Updated to include referral earnings

      referralEarnings, // Added separate referral earnings

      points: req.user.points,

      pointsTrend: Math.round(pointsTrend),

      videosWatched,

      referrals: referrals.length,

      activeReferrals: activeReferrals.length,

      recentActivity: recentActivity.slice(0, 10)

    });

  } catch (error) {

    next(error);

  }

};



// Get user's referrals

export const getReferrals = async (req, res, next) => {

  try {

    const referrals = await User.find({ referredBy: req.user._id })

      .select('fullName isActive earnings createdAt')

      .sort('-createdAt');



    const stats = {

      total: referrals.length,

      active: referrals.filter(ref => ref.isActive).length,

      earnings: referrals.reduce((sum, ref) => sum + ref.earnings, 0)

    };



    res.status(200).json({

      stats,

      referrals

    });

  } catch (error) {

    next(error);

  }

};



// Get user's referral info

export const getReferralInfo = async (req, res, next) => {

  try {

    const user = await User.findById(req.user._id)

      .select('referralCode');

    

    const referralCount = await User.countDocuments({ referredBy: req.user._id });

    const activeReferrals = await User.countDocuments({ 

      referredBy: req.user._id,

      isActive: true 

    });



    res.status(200).json({

      referralCode: user.referralCode,

      referralLink: `${process.env.FRONTEND_URL}/register?ref=${user.referralCode}`,

      totalReferrals: referralCount,

      activeReferrals

    });

  } catch (error) {

    next(error);

  }

};

export const activateAccount = async (req, res, next) => {
    // Activation logic...
};

export const getWatchedVideos = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).populate('videosWatched.videoId');
        res.status(200).json(user.videosWatched);
    } catch (error) {
        next(error);
    }
};

export const getWithdrawalsSummary = async (req, res, next) => {
  try {
    const withdrawals = await Withdrawal.find({ user: req.user._id });
    res.status(200).json(withdrawals);
  } catch (error) {
    next(error);
  }
};

import User from '../models/User.js';

import jwt from 'jsonwebtoken';

import bcrypt from 'bcryptjs';

import ErrorResponse from '../utils/errorResponse.js';

import Video from '../models/Video.js';

import Withdrawal from '../models/Withdrawal.js';

import WatchedVideo from '../models/WatchedVideo.js'; // Add this import

import Transaction from '../models/Transaction.js';

import Photo from '../models/Photo.js';

import PhotoShare from '../models/PhotoShare.js';

import { calculateMultilevelReferralEarnings, getUserReferralStructure, getDetailedMultilevelStructure } from '../utils/referralCalculations.js';
import BonusTransaction from '../models/BonusTransaction.js';

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
    
    // Get user's current points and earnings from database (includes photo earnings)
    const user = await User.findById(userId);
    
    const watchedVideos = await WatchedVideo.find({ user: userId })
      .populate('video', 'pointsReward');
    
    // Calculate video earnings from actual watched videos
    const videoPoints = watchedVideos.reduce((total, watch) => 
      total + (watch.pointsEarned || 0), 0);
    
    // Get photo shares count and earnings
    const photoShares = await PhotoShare.find({ user: userId });
    const photoPoints = photoShares.reduce((total, share) => total + (share.rwfEarned || 0), 0);
    const photoSharesCount = photoShares.length;
    
    const referralCount = await User.countDocuments({ referredBy: userId });
    const activeReferrals = await User.countDocuments({ 
      referredBy: userId,
      isActive: true 
    });

    // Calculate multi-level referral earnings using utility
    const multilevelData = await calculateMultilevelReferralEarnings(userId);

    const welcomeBonus = 3000;
    
    // Use actual user points from database (includes all earnings: video + photo + bonuses)
    const totalPoints = user.points || 0;
    
    // Calculate total earnings from all sources
    // videoEarnings = actual video earnings from watched videos
    const videoEarnings = videoPoints;
    const bonusEarnings = user.bonusEarnings || 0;
    const referralEarnings = multilevelData.totalEarnings;
    const totalEarnings = videoEarnings + photoPoints + bonusEarnings + referralEarnings + welcomeBonus;

    res.status(200).json({
      success: true,
      data: {
        points: totalPoints,
        videoPoints,
        photoPoints,
        photoShares: photoSharesCount,
        welcomeBonus,
        earnings: totalEarnings,
        videoEarnings,
        photoEarnings: photoPoints,
        bonusEarnings,
        referralEarnings,
        referrals: referralCount,
        activeReferrals,
        level1Count: multilevelData.level1Count,
        level2Count: multilevelData.level2Count,
        level3Count: multilevelData.level3Count,
        referralBreakdown: multilevelData.earnings,
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

// Old calculateReferralEarnings function removed - now using utility function

// Get user's referrals with detailed info
export const getUserReferrals = async (req, res, next) => {
  try {
    const referralStructure = await getUserReferralStructure(req.user._id);

    res.status(200).json({
      success: true,
      data: referralStructure
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

    // Calculate multi-level earnings for summary
    const multilevelData = await calculateMultilevelReferralEarnings(req.user._id);

    res.status(200).json({
      success: true,
      data: {
        referralCode: user.referralCode,
        referralLink,
        totalReferrals,
        activeReferrals,
        earnings: multilevelData.totalEarnings,
        breakdown: multilevelData.earnings,
        levels: {
          level1: multilevelData.level1Count,
          level2: multilevelData.level2Count,
          level3: multilevelData.level3Count
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Check pending activation status
export const checkPendingActivation = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Find the most recent pending transaction for this user
    const pendingTransaction = await Transaction.findOne({
      user: userId,
      status: 'pending'
    }).sort({ submittedAt: -1 });

    if (!pendingTransaction) {
      return res.status(200).json({
        success: true,
        data: {
          hasPending: false,
          message: 'No pending activation found'
        }
      });
    }

    res.status(200).json({
      success: true,
      data: {
        hasPending: true,
        transaction: {
          id: pendingTransaction._id,
          transactionId: pendingTransaction.transactionId,
          amount: pendingTransaction.amount,
          status: pendingTransaction.status,
          submittedAt: pendingTransaction.submittedAt
        }
      }
    });

  } catch (error) {
    console.error('Error checking pending activation:', error);
    next(new ErrorResponse('Failed to check pending activation', 500));
  }
};

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



    // Get referrals and calculate multilevel earnings
    const multilevelData = await calculateMultilevelReferralEarnings(req.user._id);
    const referralEarnings = multilevelData.totalEarnings;

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
    // Get complete multilevel structure for stats including level 2 and 3
    const multilevelData = await getDetailedMultilevelStructure(req.user._id);
    
    const stats = {
      total: multilevelData.stats.total,
      level1Count: multilevelData.stats.level1Count,
      level2Count: multilevelData.stats.level2Count,
      level3Count: multilevelData.stats.level3Count,
      active: multilevelData.stats.active,
      level1Active: multilevelData.stats.level1Active,
      level2Active: multilevelData.stats.level2Active,
      level3Active: multilevelData.stats.level3Active,
      earnings: multilevelData.stats.earnings,
      breakdown: multilevelData.stats.breakdown
    };

    res.status(200).json({
      stats,
      referrals: multilevelData.referrals,
      level1Referrals: multilevelData.level1Referrals,
      level2Referrals: multilevelData.level2Referrals,
      level3Referrals: multilevelData.level3Referrals
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

// Photo sharing endpoints

// Share photo and earn RWF
export const sharePhoto = async (req, res, next) => {
  try {
    const { photoId, platform } = req.body;
    const userId = req.user._id;

    // Validate photo exists and is active
    const photo = await Photo.findOne({ _id: photoId, isActive: true });
    if (!photo) {
      return next(new ErrorResponse('Photo not found or inactive', 404));
    }

    // CHECK FOR DUPLICATE SHARE BY THIS USER ONLY
    // Allow different users to share the same photo - only prevent the SAME user from sharing the same photo twice
    const userSharedPhoto = await PhotoShare.findOne({ 
      user: userId, 
      photo: photoId 
    });

    if (userSharedPhoto) {
      // This specific user already shared this photo
      const user = await User.findById(userId);
      return res.status(200).json({
        success: true,
        message: 'You have already shared this photo',
        pointsEarned: 0,
        data: userSharedPhoto,
        totalPoints: user.points,
        totalEarnings: user.earnings
      });
    }

    try {
      // Create share record (upsert to handle any race conditions)
      const photoShare = await PhotoShare.findOneAndUpdate(
        {
          user: userId,
          photo: photoId
        },
        {
          $setOnInsert: {
            user: userId,
            photo: photoId,
            platform: platform || 'whatsapp',
            rwfEarned: 50
          }
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      // Update photo share count
      await Photo.findByIdAndUpdate(photoId, {
        $inc: { shareCount: 1, totalRwfPaid: 50 }
      });

      // Update user points/earnings and get updated user
      const updatedUser = await User.findByIdAndUpdate(userId, {
        $inc: { points: 50, earnings: 50 }
      }, { new: true });

      res.status(201).json({
        success: true,
        data: photoShare,
        pointsEarned: 50,
        totalPoints: updatedUser.points,
        totalEarnings: updatedUser.earnings,
        message: 'Photo shared successfully! You earned 50 RWF!'
      });
    } catch (createError) {
      // Handle any remaining E11000 errors gracefully
      if (createError.code === 11000) {
        console.log(`User ${userId} attempted to share photo ${photoId} - duplicate detected`);
        const user = await User.findById(userId);
        const share = await PhotoShare.findOne({ user: userId, photo: photoId });
        return res.status(200).json({
          success: true,
          message: 'You have already shared this photo',
          pointsEarned: 0,
          data: share,
          totalPoints: user.points,
          totalEarnings: user.earnings
        });
      }
      throw createError;
    }
  } catch (error) {
    console.error('Photo share error:', error);
    next(error);
  }
};

// Get user's photo shares
export const getUserPhotoShares = async (req, res, next) => {
  try {
    const shares = await PhotoShare.find({ user: req.user._id })
      .populate('photo', 'title imageUrl')
      .sort('-createdAt')
      .limit(50);

    res.status(200).json({
      success: true,
      data: shares
    });
  } catch (error) {
    next(error);
  }
};

// Get user bonus history
export const getBonusHistory = async (req, res, next) => {
  try {
    const userId = req.user._id;
    
    // Get bonus transactions for the user
    const bonusTransactions = await BonusTransaction.find({ user: userId })
      .populate('addedBy', 'fullName email')
      .sort('-addedAt')
      .limit(50);

    // Create notification-style history
    const bonusHistory = bonusTransactions.map(transaction => ({
      id: transaction._id,
      type: 'bonus',
      title: `Bonus Added: ${transaction.type}`,
      description: transaction.description || `Admin added RWF ${transaction.amount.toLocaleString()} bonus`,
      amount: transaction.amount,
      status: transaction.status,
      createdAt: transaction.addedAt,
      addedBy: transaction.addedBy?.fullName || 'Admin'
    }));

    res.status(200).json({
      success: true,
      data: {
        bonusHistory,
        totalBonuses: bonusTransactions.length,
        totalAmount: bonusTransactions.reduce((sum, t) => sum + t.amount, 0)
      }
    });
  } catch (error) {
    console.error('Error fetching bonus history:', error);
    next(error);
  }
};

// Get leaderboard data for top referrers
export const getLeaderboard = async (req, res, next) => {
  try {
    // Aggregation pipeline to get referrer performance
    const aggregationPipeline = [
      // Match users who have referrals
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $match: {
          'referrals.0': { $exists: true } // Only users with referrals
        }
      },
      {
        $addFields: {
          totalReferrals: { $size: '$referrals' },
          activeReferrals: {
            $size: {
              $filter: {
                input: '$referrals',
                as: 'referral',
                cond: { $eq: ['$$referral.isActive', true] }
              }
            }
          }
        }
      },
      {
        $addFields: {
          conversionRate: {
            $cond: [
              { $eq: ['$totalReferrals', 0] },
              0,
              { $multiply: [{ $divide: ['$activeReferrals', '$totalReferrals'] }, 100] }
            ]
          },
          activityScore: {
            $min: [
              100,
              {
                $add: [
                  { $multiply: ['$conversionRate', 0.4] }, // 40% weight on conversion
                  { $multiply: [{ $min: [50, '$totalReferrals'] }, 0.6] } // 60% weight on volume (capped at 50)
                ]
              }
            ]
          }
        }
      },
      {
        $project: {
          password: 0,
          'referrals.password': 0
        }
      }
    ];

    // Apply sorting by total earnings (using multilevel earnings calculation)
    const referrers = await User.aggregate([
      ...aggregationPipeline,
      { $sort: { totalReferrals: -1 } }
    ]);

    // Transform referrers data to include user info and calculate multilevel earnings
    const transformedReferrers = await Promise.all(referrers.map(async (referrer) => {
      // Calculate actual multilevel earnings
      const multilevelData = await calculateMultilevelReferralEarnings(referrer._id);
      
      return {
        userId: referrer._id,
        user: {
          fullName: referrer.fullName,
          createdAt: referrer.createdAt,
          isActive: referrer.isActive
        },
        activeReferrals: referrer.activeReferrals,
        totalEarnings: multilevelData.totalEarnings,
        conversionRate: Math.round(referrer.conversionRate * 10) / 10,
        activityScore: Math.round(referrer.activityScore),
        multilevelBreakdown: multilevelData.earnings,
        levels: {
          level1: multilevelData.level1Count,
          level2: multilevelData.level2Count,
          level3: multilevelData.level3Count
        }
      };
    }));

    // Sort by total earnings (descending)
    transformedReferrers.sort((a, b) => b.totalEarnings - a.totalEarnings);

    // Limit to top 10
    const topTenReferrers = transformedReferrers.slice(0, 10);

    // Calculate overall stats
    const allReferrers = await User.aggregate(aggregationPipeline);
    let totalEarnings = 0;
    for (const referrer of allReferrers) {
      const multilevelData = await calculateMultilevelReferralEarnings(referrer._id);
      totalEarnings += multilevelData.totalEarnings;
    }

    const stats = {
      totalReferrers: allReferrers.length,
      totalReferrals: allReferrers.reduce((sum, r) => sum + r.totalReferrals, 0),
      totalEarnings: totalEarnings, // Use real multilevel earnings
      activeReferrers: allReferrers.filter(r => r.activeReferrals > 0).length,
      avgConversionRate: allReferrers.length > 0 
        ? (allReferrers.reduce((sum, r) => sum + r.conversionRate, 0) / allReferrers.length).toFixed(1)
        : 0,
      topEarner: topTenReferrers[0] || null,
      recentGrowth: 0 // Placeholder for growth data
    };

    res.json({
      referrers: topTenReferrers,
      stats
    });

  } catch (error) {
    next(error);
  }
};

import User from '../models/User.js';
import MultilevelEarnings from '../models/MultilevelEarnings.js';

/**
 * Calculate multilevel referral earnings for a user
 * Level 1: 3200 RWF per active referral
 * Level 2: 1100 RWF per active referral  
 * Level 3: 700 RWF per active referral
 * @param {string} userId - The user ID to calculate earnings for
 * @returns {Promise<Object>} Earnings breakdown and totals
 */
export const calculateMultilevelReferralEarnings = async (userId) => {
  try {
    // Get Level 1 referrals (direct referrals)
    const level1Referrals = await User.find({ 
      referredBy: userId, 
      isActive: true,
      isDeleted: { $ne: true }
    }).select('_id');

    // Get Level 2 referrals (referrals of level 1 referrals)
    const level2Referrals = await User.find({ 
      referredBy: { $in: level1Referrals.map(r => r._id) },
      isActive: true,
      isDeleted: { $ne: true }
    }).select('_id');

    // Get Level 3 referrals (referrals of level 2 referrals)
    const level3Referrals = await User.find({ 
      referredBy: { $in: level2Referrals.map(r => r._id) },
      isActive: true,
      isDeleted: { $ne: true }
    }).select('_id');

    const level1Count = level1Referrals.length;
    const level2Count = level2Referrals.length;
    const level3Count = level3Referrals.length;

    const earnings = {
      level1: level1Count * 3200,
      level2: level2Count * 1100,
      level3: level3Count * 700
    };

    const totalEarnings = earnings.level1 + earnings.level2 + earnings.level3;

    return {
      level1Count,
      level2Count, 
      level3Count,
      earnings,
      totalEarnings,
      totalReferrals: level1Count + level2Count + level3Count,
      activeReferrals: level1Count // Direct referrals for backwards compatibility
    };
  } catch (error) {
    console.error('Error calculating multilevel referral earnings:', error);
    throw error;
  }
};

/**
 * Update and store multilevel earnings for a user
 * @param {string} userId - The user ID to update earnings for
 * @returns {Promise<Object>} Updated earnings data
 */
export const updateMultilevelEarnings = async (userId) => {
  try {
    const earningsData = await calculateMultilevelReferralEarnings(userId);
    
    // Get existing earnings to calculate difference
    const existingEarnings = await MultilevelEarnings.findOne({ user: userId });
    const previousTotalEarnings = existingEarnings?.totalEarnings || 0;
    const earningsDifference = earningsData.totalEarnings - previousTotalEarnings;
    
    // Update or create multilevel earnings record
    const multilevelEarnings = await MultilevelEarnings.findOneAndUpdate(
      { user: userId },
      {
        user: userId,
        level1: {
          count: earningsData.level1Count,
          earnings: earningsData.earnings.level1,
          lastUpdated: new Date()
        },
        level2: {
          count: earningsData.level2Count,
          earnings: earningsData.earnings.level2,
          lastUpdated: new Date()
        },
        level3: {
          count: earningsData.level3Count,
          earnings: earningsData.earnings.level3,
          lastUpdated: new Date()
        },
        totalEarnings: earningsData.totalEarnings,
        lastCalculated: new Date(),
        isActive: true,
        adminEdited: false,
        editReason: ''
      },
      { upsert: true, new: true }
    );

    // Update user's referral earnings
    if (earningsDifference !== 0) {
      try {
        const User = (await import('../models/User.js')).default;
        
        // Update user's referral earnings field
        await User.findByIdAndUpdate(
          userId,
          {
            $inc: {
              referralEarnings: earningsDifference
            }
          }
        );

        console.log(`Updated user ${userId} referral earnings by ${earningsDifference}`);
      } catch (updateError) {
        console.error('Error updating user referral earnings:', updateError);
        // Don't throw error here, just log it as the main operation succeeded
      }
    }

    return multilevelEarnings;
  } catch (error) {
    console.error('Error updating multilevel earnings:', error);
    throw error;
  }
};

/**
 * Get all multilevel earnings with pagination and filtering (optimized)
 * @param {Object} options - Query options
 * @returns {Promise<Object>} Paginated earnings data
 */
export const getAllMultilevelEarnings = async (options = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'totalEarnings',
      sortOrder = 'desc',
      minEarnings = 0,
      maxEarnings = null
    } = options;

    const skip = (page - 1) * limit;
    
    // Build match criteria - include all users, even those with 0 earnings
    const matchCriteria = {
      isActive: true
    };

    // Only apply earnings filters if they're not the default values
    if (minEarnings > 0 || maxEarnings !== null) {
      matchCriteria.totalEarnings = { $gte: minEarnings };
      if (maxEarnings !== null) {
        matchCriteria.totalEarnings.$lte = maxEarnings;
      }
    }

    // Optimized aggregation pipeline with better performance
    const pipeline = [
      {
        $match: matchCriteria
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'userInfo',
          pipeline: [
            {
              $project: {
                fullName: 1,
                email: 1,
                mobileNumber: 1
              }
            }
          ]
        }
      },
      {
        $unwind: '$userInfo'
      }
    ];

    // Add search filter if provided (optimized with index)
    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { 'userInfo.fullName': { $regex: search, $options: 'i' } },
            { 'userInfo.email': { $regex: search, $options: 'i' } },
            { 'userInfo.mobileNumber': { $regex: search, $options: 'i' } }
          ]
        }
      });
    }

    // Add sorting (optimized with compound index)
    const sortCriteria = {};
    sortCriteria[sortBy] = sortOrder === 'desc' ? -1 : 1;
    pipeline.push({ $sort: sortCriteria });

    // Add pagination
    pipeline.push(
      { $skip: skip },
      { $limit: limit }
    );

    // Execute aggregation with parallel execution
    const [earnings, countResult] = await Promise.all([
      MultilevelEarnings.aggregate(pipeline),
      MultilevelEarnings.aggregate([
        ...pipeline.slice(0, -2), // Remove skip and limit
        { $count: 'total' }
      ])
    ]);

    const total = countResult[0]?.total || 0;


    return {
      earnings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  } catch (error) {
    console.error('Error getting all multilevel earnings:', error);
    throw error;
  }
};

/**
 * Get detailed referral structure for a user
 * @param {string} userId - The user ID to get referrals for
 * @returns {Promise<Object>} Detailed referral structure
 */
export const getUserReferralStructure = async (userId) => {
  try {
    // Get all direct referrals with basic info including mobile number
    const directReferrals = await User.find({ referredBy: userId, isDeleted: { $ne: true } })
      .select('fullName email mobileNumber isActive createdAt')
      .sort('-createdAt');

    const earnings = await calculateMultilevelReferralEarnings(userId);

    return {
      referrals: directReferrals,
      stats: {
        total: directReferrals.length,
        active: directReferrals.filter(ref => ref.isActive).length,
        level1Count: earnings.level1Count,
        level2Count: earnings.level2Count,
        level3Count: earnings.level3Count,
        earnings: earnings.totalEarnings,
        breakdown: earnings.earnings
      }
    };
  } catch (error) {
    console.error('Error getting user referral structure:', error);
    throw error;
  }
};

/**
 * Get detailed multilevel referral structure for a user including level 2 and level 3
 * @param {string} userId - The user ID to get referrals for
 * @returns {Promise<Object>} Detailed multilevel referral structure
 */
export const getDetailedMultilevelStructure = async (userId) => {
  try {
    // Get Level 1 referrals (direct referrals)
    const level1Referrals = await User.find({ referredBy: userId, isDeleted: { $ne: true } })
      .select('fullName email mobileNumber isActive createdAt _id')
      .sort('-createdAt');

    // Get Level 2 referrals (referrals of level 1 referrals)
    const level1Ids = level1Referrals.map(r => r._id);
    const level2Referrals = await User.find({ 
      referredBy: { $in: level1Ids },
      isDeleted: { $ne: true }
    })
      .select('fullName email mobileNumber isActive createdAt _id referredBy')
      .sort('-createdAt');

    // Get Level 3 referrals (referrals of level 2 referrals)
    const level2Ids = level2Referrals.map(r => r._id);
    const level3Referrals = await User.find({ 
      referredBy: { $in: level2Ids },
      isDeleted: { $ne: true }
    })
      .select('fullName email mobileNumber isActive createdAt _id referredBy')
      .sort('-createdAt');

    // Add level information to each referral
    const level1WithInfo = level1Referrals.map(ref => ({
      ...ref.toObject(),
      level: 1,
      earnings: ref.isActive ? 3200 : 0
    }));

    const level2WithInfo = level2Referrals.map(ref => ({
      ...ref.toObject(),
      level: 2,
      earnings: ref.isActive ? 1100 : 0
    }));

    const level3WithInfo = level3Referrals.map(ref => ({
      ...ref.toObject(),
      level: 3,
      earnings: ref.isActive ? 700 : 0
    }));

    // Combine all referrals
    const allReferrals = [...level1WithInfo, ...level2WithInfo, ...level3WithInfo];

    const earnings = await calculateMultilevelReferralEarnings(userId);

    return {
      referrals: allReferrals,
      level1Referrals: level1WithInfo,
      level2Referrals: level2WithInfo,
      level3Referrals: level3WithInfo,
      stats: {
        total: allReferrals.length,
        level1Count: level1WithInfo.length,
        level2Count: level2WithInfo.length,
        level3Count: level3WithInfo.length,
        active: allReferrals.filter(ref => ref.isActive).length,
        level1Active: level1WithInfo.filter(ref => ref.isActive).length,
        level2Active: level2WithInfo.filter(ref => ref.isActive).length,
        level3Active: level3WithInfo.filter(ref => ref.isActive).length,
        earnings: earnings.totalEarnings,
        breakdown: earnings.earnings
      }
    };
  } catch (error) {
    console.error('Error getting detailed multilevel structure:', error);
    throw error;
  }
};
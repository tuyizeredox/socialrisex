import User from '../models/User.js';

/**
 * Calculate multilevel referral earnings for a user
 * Level 1: 4000 RWF per active referral
 * Level 2: 1500 RWF per active referral  
 * Level 3: 1000 RWF per active referral
 * @param {string} userId - The user ID to calculate earnings for
 * @returns {Promise<Object>} Earnings breakdown and totals
 */
export const calculateMultilevelReferralEarnings = async (userId) => {
  try {
    // Get Level 1 referrals (direct referrals)
    const level1Referrals = await User.find({ 
      referredBy: userId, 
      isActive: true 
    }).select('_id');

    // Get Level 2 referrals (referrals of level 1 referrals)
    const level2Referrals = await User.find({ 
      referredBy: { $in: level1Referrals.map(r => r._id) },
      isActive: true 
    }).select('_id');

    // Get Level 3 referrals (referrals of level 2 referrals)
    const level3Referrals = await User.find({ 
      referredBy: { $in: level2Referrals.map(r => r._id) },
      isActive: true 
    }).select('_id');

    const level1Count = level1Referrals.length;
    const level2Count = level2Referrals.length;
    const level3Count = level3Referrals.length;

    const earnings = {
      level1: level1Count * 4000,
      level2: level2Count * 1500,
      level3: level3Count * 1000
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
 * Get detailed referral structure for a user
 * @param {string} userId - The user ID to get referrals for
 * @returns {Promise<Object>} Detailed referral structure
 */
export const getUserReferralStructure = async (userId) => {
  try {
    // Get all direct referrals with basic info
    const directReferrals = await User.find({ referredBy: userId })
      .select('fullName email isActive createdAt')
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
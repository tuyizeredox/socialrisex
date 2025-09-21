import User from '../models/User.js';
import Video from '../models/Video.js';
import Withdrawal from '../models/Withdrawal.js';
import Transaction from '../models/Transaction.js';
import ErrorResponse from '../utils/errorResponse.js';
import { calculateMultilevelReferralEarnings } from '../utils/referralCalculations.js';

// Dashboard Stats
export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalVideos,
      activeVideos,
      pendingWithdrawals,
      pendingTransactions,
      totalPointsArray,
      pendingAmountArray,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Video.countDocuments(),
      Video.countDocuments({ isActive: true }),
      Withdrawal.countDocuments({ status: 'pending' }),
      Transaction.countDocuments({ status: 'pending' }),
      User.aggregate([{ $group: { _id: null, total: { $sum: '$points' } } }]),
      Withdrawal.aggregate([
        { $match: { status: 'pending' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalVideos,
      activeVideos,
      pendingWithdrawals,
      pendingTransactions,
      totalPoints: totalPointsArray[0]?.total || 0,
      pendingAmount: pendingAmountArray[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

// User Management
export const getUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = search
      ? {
          $or: [
            { fullName: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
          ],
        }
      : {};

    const total = await User.countDocuments(query);

    const users = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals',
        },
      },
      {
        $addFields: {
          referralCount: { $size: '$referrals' },
        },
      },
      {
        $project: {
          password: 0,
          'referrals.password': 0,
        },
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
    ]);

    const transformedUsers = users.map((user) => ({
      ...user,
      referralCount: user.referralCount || 0,
      earnings: user.earnings || 0,
      points: user.points || 0,
      isActive: user.isActive || false,
    }));

    res.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).select('-password');

    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    await user.deleteOne();
    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// Video Management
export const getAdminVideos = async (req, res, next) => {
  try {
    const videos = await Video.find()
      .populate('addedBy', 'fullName email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      videos,
    });
  } catch (error) {
    next(error);
  }
};

const extractYoutubeId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname.includes('youtube.com')) {
      return urlObj.searchParams.get('v');
    } else if (urlObj.hostname.includes('youtu.be')) {
      return urlObj.pathname.slice(1);
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const createVideo = async (req, res, next) => {
  try {
    const { title, youtubeUrl, pointsReward, minimumWatchTime, isActive } = req.body;

    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) {
      throw new ErrorResponse('Invalid YouTube URL', 400);
    }

    const existingVideo = await Video.findOne({ youtubeId });
    if (existingVideo) {
      throw new ErrorResponse('Video already exists', 400);
    }

    const video = await Video.create({
      title,
      youtubeUrl,
      youtubeId,
      pointsReward,
      minimumWatchTime,
      isActive,
      addedBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVideo = async (req, res, next) => {
  try {
    const { youtubeUrl } = req.body;
    let update = { ...req.body };

    if (youtubeUrl) {
      const youtubeId = extractYoutubeId(youtubeUrl);
      if (!youtubeId) {
        throw new ErrorResponse('Invalid YouTube URL', 400);
      }
      update.youtubeId = youtubeId;
    }

    const video = await Video.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });

    if (!video) {
      throw new ErrorResponse('Video not found', 404);
    }

    res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      throw new ErrorResponse('Video not found', 404);
    }

    await video.deleteOne();
    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// Withdrawal Management
export const getPendingWithdrawals = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const total = await Withdrawal.countDocuments({ status: 'pending' });
    const withdrawals = await Withdrawal.find({ status: 'pending' })
      .populate('user', 'fullName email')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({
      withdrawals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateWithdrawal = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const withdrawal = await Withdrawal.findByIdAndUpdate(
      req.params.id,
      { status, notes, processedAt: Date.now() },
      { new: true }
    ).populate('user', 'fullName email');

    if (!withdrawal) {
      throw new ErrorResponse('Withdrawal not found', 404);
    }

    res.json(withdrawal);
  } catch (error) {
    next(error);
  }
};

// Optimized Transaction Management
export const getPendingTransactions = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Cap at 100
    const search = req.query.search || '';
    const filter = req.query.filter || 'all';
    const status = req.query.status;
    const dateRange = req.query.dateRange;

    // Build optimized aggregation pipeline
    let matchStage = {};
    
    // Filter by status
    if (filter === 'pending') {
      matchStage.status = 'pending';
    } else if (filter === 'duplicate') {
      matchStage.isDuplicate = true;
    } else if (filter === 'processed') {
      matchStage.status = { $in: ['approved', 'rejected'] };
    } else if (status && status !== 'all') {
      matchStage.status = status;
    }

    // Date range filter
    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let dateFilter;
      
      switch (dateRange) {
        case 'today':
          dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
          break;
        case '7d':
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case '30d':
          dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case '90d':
          dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
      }
      
      if (dateFilter) {
        matchStage.submittedAt = dateFilter;
      }
    }

    // Search functionality with user data
    if (search) {
      // First find matching users
      const matchingUsers = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id').lean();

      const userIds = matchingUsers.map(u => u._id);

      matchStage.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } }
      ];
    }

    // Optimized aggregation pipeline
    const pipeline = [
      { $match: matchStage },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user',
          pipeline: [{ $project: { fullName: 1, email: 1, mobileNumber: 1, createdAt: 1, isActive: 1 } }]
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'processedBy',
          foreignField: '_id',
          as: 'processedBy',
          pipeline: [{ $project: { fullName: 1 } }]
        }
      },
      { $unwind: '$user' },
      { $unwind: { path: '$processedBy', preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: 'transactions',
          let: { transactionId: '$transactionId', currentId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ['$transactionId', '$$transactionId'] },
                    { $ne: ['$_id', '$$currentId'] }
                  ]
                }
              }
            },
            { $count: 'count' }
          ],
          as: 'duplicateCount'
        }
      },
      {
        $lookup: {
          from: 'transactions',
          let: { userId: '$user._id' },
          pipeline: [
            { $match: { $expr: { $eq: ['$user', '$$userId'] } } },
            { $count: 'count' }
          ],
          as: 'userAttempts'
        }
      },
      {
        $addFields: {
          duplicateCount: { $ifNull: [{ $arrayElemAt: ['$duplicateCount.count', 0] }, 0] },
          userAttempts: { $ifNull: [{ $arrayElemAt: ['$userAttempts.count', 0] }, 1] },
          isDuplicate: { $gt: [{ $ifNull: [{ $arrayElemAt: ['$duplicateCount.count', 0] }, 0] }, 0] }
        }
      },
      { $sort: { submittedAt: -1 } }
    ];

    // Get total count for pagination
    const totalPipeline = [...pipeline, { $count: 'total' }];
    const totalResult = await Transaction.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Get paginated results
    const resultPipeline = [
      ...pipeline,
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    // Execute both queries in parallel for better performance
    const [transactions, stats] = await Promise.all([
      Transaction.aggregate(resultPipeline),
      Transaction.aggregate([
        {
          $facet: {
            pending: [{ $match: { status: 'pending' } }, { $count: 'count' }],
            approved: [{ $match: { status: 'approved' } }, { $count: 'count' }],
            rejected: [{ $match: { status: 'rejected' } }, { $count: 'count' }],
            duplicates: [{ $match: { isDuplicate: true } }, { $count: 'count' }]
          }
        }
      ])
    ]);

    // Extract stats with default values
    const statsResult = stats[0];
    const finalStats = {
      pending: statsResult.pending[0]?.count || 0,
      approved: statsResult.approved[0]?.count || 0,
      rejected: statsResult.rejected[0]?.count || 0,
      duplicates: statsResult.duplicates[0]?.count || 0
    };

    res.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: finalStats
    });
  } catch (error) {
    console.error('Transaction fetch error:', error);
    next(error);
  }
};

export const processTransaction = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body; // status: 'approved', 'rejected'
    
    if (!['approved', 'rejected'].includes(status)) {
      throw new ErrorResponse('Invalid status. Must be approved or rejected', 400);
    }

    const transaction = await Transaction.findById(id).populate('user');
    
    if (!transaction) {
      throw new ErrorResponse('Transaction not found', 404);
    }

    if (transaction.status !== 'pending') {
      throw new ErrorResponse('Transaction has already been processed', 400);
    }

    // Update transaction
    transaction.status = status;
    transaction.processedAt = new Date();
    transaction.processedBy = req.user._id;
    transaction.notes = notes || '';
    
    await transaction.save();

    // If approved, activate the user
    if (status === 'approved') {
      const user = transaction.user;
      
      // Check if user is already active
      if (user.isActive) {
        throw new ErrorResponse('User account is already active', 400);
      }

      user.isActive = true;
      user.activatedAt = new Date();
      user.paymentTransactionId = transaction.transactionId;
      await user.save();

      // Process referral bonus if user was referred
      if (user.referredBy) {
        const referrer = await User.findById(user.referredBy);
        if (referrer) {
          // Update referrer's referral count
          referrer.referralCount += 1;
          await referrer.save();
          
          // Note: Multilevel earnings are now calculated dynamically in real-time
          // No need to store static earnings anymore as they depend on the full tree
        }
      }
    }

    // Return updated transaction with user data
    const updatedTransaction = await Transaction.findById(id)
      .populate('user', 'fullName email isActive')
      .populate('processedBy', 'fullName');

    res.json({
      success: true,
      message: `Transaction ${status} successfully`,
      transaction: updatedTransaction
    });

  } catch (error) {
    next(error);
  }
};

// Export transactions to CSV
export const exportTransactions = async (req, res, next) => {
  try {
    const { search, filter, status, dateRange } = req.query;

    // Build the same match query as in getPendingTransactions
    let matchStage = {};
    
    if (filter === 'pending') {
      matchStage.status = 'pending';
    } else if (filter === 'duplicate') {
      matchStage.isDuplicate = true;
    } else if (filter === 'processed') {
      matchStage.status = { $in: ['approved', 'rejected'] };
    } else if (status && status !== 'all') {
      matchStage.status = status;
    }

    if (dateRange && dateRange !== 'all') {
      const now = new Date();
      let dateFilter;
      
      switch (dateRange) {
        case 'today':
          dateFilter = { $gte: new Date(now.setHours(0, 0, 0, 0)) };
          break;
        case '7d':
          dateFilter = { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) };
          break;
        case '30d':
          dateFilter = { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) };
          break;
        case '90d':
          dateFilter = { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) };
          break;
      }
      
      if (dateFilter) {
        matchStage.submittedAt = dateFilter;
      }
    }

    if (search) {
      const matchingUsers = await User.find({
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      }).select('_id').lean();

      const userIds = matchingUsers.map(u => u._id);

      matchStage.$or = [
        { transactionId: { $regex: search, $options: 'i' } },
        { user: { $in: userIds } }
      ];
    }

    const transactions = await Transaction.find(matchStage)
      .populate('user', 'fullName email mobileNumber')
      .populate('processedBy', 'fullName')
      .sort({ submittedAt: -1 })
      .lean();

    // Create CSV content
    const csvHeaders = [
      'Transaction ID',
      'User Name',
      'Email',
      'Mobile',
      'Amount (RWF)',
      'Status',
      'Submitted At',
      'Processed At',
      'Processed By',
      'Notes'
    ];

    const csvRows = transactions.map(t => [
      t.transactionId,
      t.user.fullName,
      t.user.email,
      t.user.mobileNumber || '',
      t.amount,
      t.status,
      new Date(t.submittedAt).toLocaleString(),
      t.processedAt ? new Date(t.processedAt).toLocaleString() : '',
      t.processedBy?.fullName || '',
      t.notes || ''
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="transactions.csv"');
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const getTransactionDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const transaction = await Transaction.findById(id)
      .populate('user', 'fullName email mobileNumber createdAt isActive')
      .populate('processedBy', 'fullName email');

    if (!transaction) {
      throw new ErrorResponse('Transaction not found', 404);
    }

    // Get duplicate transactions with same ID
    const duplicateTransactions = await Transaction.find({
      transactionId: transaction.transactionId,
      _id: { $ne: transaction._id }
    }).populate('user', 'fullName email').sort({ submittedAt: -1 });

    // Get user's transaction history
    const userTransactions = await Transaction.find({
      user: transaction.user._id,
      _id: { $ne: transaction._id }
    }).sort({ submittedAt: -1 }).limit(5);

    res.json({
      transaction,
      duplicateTransactions,
      userTransactions,
      stats: {
        duplicateCount: duplicateTransactions.length + 1,
        userTotalTransactions: userTransactions.length + 1
      }
    });

  } catch (error) {
    next(error);
  }
};

// Leaderboard Management
export const getLeaderboard = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const timeRange = req.query.timeRange || 'all';
    const sortBy = req.query.sortBy || 'totalEarnings';

    // Build time range filter
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
      case '1y':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    // Combine search and date filters for user lookup
    const userMatchQuery = { ...searchQuery, ...dateFilter };

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
          'referrals.0': { $exists: true }, // Only users with referrals
          ...userMatchQuery
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
          },
          recentReferrals: {
            $size: {
              $filter: {
                input: '$referrals',
                as: 'referral',
                cond: { 
                  $gte: ['$$referral.createdAt', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)]
                }
              }
            }
          }
        }
      },
      {
        $addFields: {
          // Note: totalEarnings will be calculated separately using multilevel system
          // These are kept for backward compatibility but will be overridden
          totalEarnings: { $multiply: ['$activeReferrals', 4000] }, // Level 1 base rate
          recentEarnings: { $multiply: ['$recentReferrals', 4000] }, // Level 1 base rate
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

    // Apply sorting
    let sortStage = {};
    switch (sortBy) {
      case 'totalReferrals':
        sortStage = { totalReferrals: -1 };
        break;
      case 'activeReferrals':
        sortStage = { activeReferrals: -1 };
        break;
      case 'conversionRate':
        sortStage = { conversionRate: -1 };
        break;
      default:
        sortStage = { totalEarnings: -1 };
    }

    // Get total count for pagination
    const totalPipeline = [...aggregationPipeline, { $count: 'total' }];
    const totalResult = await User.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Get paginated results
    const referrersPipeline = [
      ...aggregationPipeline,
      { $sort: sortStage },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ];

    const referrers = await User.aggregate(referrersPipeline);

    // Transform referrers data to include user info and calculate multilevel earnings
    const transformedReferrers = await Promise.all(referrers.map(async (referrer) => {
      // Calculate actual multilevel earnings
      const multilevelData = await calculateMultilevelReferralEarnings(referrer._id);
      
      return {
        userId: referrer._id,
        user: {
          fullName: referrer.fullName,
          email: referrer.email,
          createdAt: referrer.createdAt,
          isActive: referrer.isActive
        },
        totalReferrals: referrer.totalReferrals,
        activeReferrals: referrer.activeReferrals,
        totalEarnings: multilevelData.totalEarnings, // Use actual multilevel earnings
        recentEarnings: referrer.recentEarnings, // Keep aggregated recent earnings for now
        conversionRate: Math.round(referrer.conversionRate * 10) / 10,
        activityScore: Math.round(referrer.activityScore),
        multilevelBreakdown: multilevelData.earnings, // Add detailed breakdown
        levels: {
          level1: multilevelData.level1Count,
          level2: multilevelData.level2Count,
          level3: multilevelData.level3Count
        }
      };
    }));

    // Get top 3 performers for highlighting
    const topPerformers = transformedReferrers.slice(0, 3);

    // Calculate overall stats with real multilevel earnings
    const allReferrers = await User.aggregate([
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
          'referrals.0': { $exists: true }
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
          },
          recentActivity: {
            $size: {
              $filter: {
                input: '$referrals',
                as: 'referral',
                cond: {
                  $gte: ['$$referral.createdAt', new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)]
                }
              }
            }
          }
        }
      }
    ]);

    // Calculate real multilevel earnings for all referrers
    let totalEarnings = 0;
    for (const referrer of allReferrers) {
      const multilevelData = await calculateMultilevelReferralEarnings(referrer._id);
      totalEarnings += multilevelData.totalEarnings;
    }

    const stats = {
      totalReferrers: allReferrers.length,
      totalReferrals: allReferrers.reduce((sum, r) => sum + r.totalReferrals, 0),
      totalEarnings: totalEarnings, // Use real multilevel earnings
      activeReferrers: allReferrers.filter(r => r.recentActivity > 0).length
    };

    res.json({
      referrers: transformedReferrers,
      topPerformers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats
    });

  } catch (error) {
    next(error);
  }
};

// Export leaderboard to CSV
export const exportLeaderboard = async (req, res, next) => {
  try {
    const { search, timeRange, sortBy } = req.query;

    // Use similar logic as getLeaderboard but without pagination
    let dateFilter = {};
    const now = new Date();
    
    switch (timeRange) {
      case '7d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
        break;
      case '30d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } };
        break;
      case '90d':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000) } };
        break;
      case '1y':
        dateFilter = { createdAt: { $gte: new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000) } };
        break;
      default:
        dateFilter = {};
    }

    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const userMatchQuery = { ...searchQuery, ...dateFilter };

    const aggregationPipeline = [
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
          'referrals.0': { $exists: true },
          ...userMatchQuery
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
          totalEarnings: { $multiply: ['$activeReferrals', 4000] }, // Placeholder - will be recalculated with multilevel
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
                  { $multiply: ['$conversionRate', 0.4] },
                  { $multiply: [{ $min: [50, '$totalReferrals'] }, 0.6] }
                ]
              }
            ]
          }
        }
      },
      {
        $project: {
          fullName: 1,
          email: 1,
          createdAt: 1,
          totalReferrals: 1,
          activeReferrals: 1,
          totalEarnings: 1,
          conversionRate: 1,
          activityScore: 1
        }
      }
    ];

    // Apply sorting
    let sortStage = {};
    switch (sortBy) {
      case 'totalReferrals':
        sortStage = { totalReferrals: -1 };
        break;
      case 'activeReferrals':
        sortStage = { activeReferrals: -1 };
        break;
      case 'conversionRate':
        sortStage = { conversionRate: -1 };
        break;
      default:
        sortStage = { totalEarnings: -1 };
    }

    const referrers = await User.aggregate([
      ...aggregationPipeline,
      { $sort: sortStage }
    ]);

    // Calculate real multilevel earnings for export
    const enrichedReferrers = await Promise.all(referrers.map(async (referrer) => {
      const multilevelData = await calculateMultilevelReferralEarnings(referrer._id);
      return {
        ...referrer,
        totalEarnings: multilevelData.totalEarnings, // Use real multilevel earnings
        level1Count: multilevelData.level1Count,
        level2Count: multilevelData.level2Count,
        level3Count: multilevelData.level3Count,
        earningsBreakdown: multilevelData.earnings
      };
    }));

    // Create CSV content with multilevel details
    const csvHeaders = [
      'Rank',
      'Name',
      'Email',
      'Join Date',
      'Total Referrals',
      'Active Referrals',
      'Level 1 Referrals',
      'Level 2 Referrals',
      'Level 3 Referrals',
      'Total Earnings (RWF)',
      'Level 1 Earnings (RWF)',
      'Level 2 Earnings (RWF)',
      'Level 3 Earnings (RWF)',
      'Conversion Rate (%)',
      'Activity Score'
    ];

    const csvRows = enrichedReferrers.map((referrer, index) => [
      index + 1,
      referrer.fullName,
      referrer.email,
      new Date(referrer.createdAt).toLocaleDateString(),
      referrer.totalReferrals,
      referrer.activeReferrals,
      referrer.level1Count,
      referrer.level2Count,
      referrer.level3Count,
      referrer.totalEarnings,
      referrer.earningsBreakdown.level1,
      referrer.earningsBreakdown.level2,
      referrer.earningsBreakdown.level3,
      Math.round(referrer.conversionRate * 10) / 10,
      Math.round(referrer.activityScore)
    ]);

    const csvContent = [csvHeaders, ...csvRows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="leaderboard.csv"');
    res.send(csvContent);
  } catch (error) {
    next(error);
  }
};

export const getReferrerDetails = async (req, res, next) => {
  try {
    const { userId } = req.params;

    const referrer = await User.findById(userId).select('-password');
    if (!referrer) {
      throw new ErrorResponse('Referrer not found', 404);
    }

    // Get detailed referral information
    const referrals = await User.find({ referredBy: userId })
      .select('fullName email createdAt isActive activatedAt')
      .sort({ createdAt: -1 });

    // Get recent referrals (last 10)
    const recentReferrals = referrals.slice(0, 10);

    // Calculate performance metrics
    const totalReferrals = referrals.length;
    const activeReferrals = referrals.filter(ref => ref.isActive).length;
    const totalEarnings = activeReferrals * 2800;
    
    // Monthly performance
    const monthlyStats = [];
    for (let i = 0; i < 12; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - i, 1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthlyReferrals = referrals.filter(ref => 
        ref.createdAt >= monthStart && ref.createdAt < monthEnd
      );
      
      monthlyStats.unshift({
        month: monthStart.toISOString().slice(0, 7), // YYYY-MM format
        referrals: monthlyReferrals.length,
        activations: monthlyReferrals.filter(ref => ref.isActive).length,
        earnings: monthlyReferrals.filter(ref => ref.isActive).length * 2800
      });
    }

    res.json({
      referrer,
      recentReferrals,
      stats: {
        totalReferrals,
        activeReferrals,
        totalEarnings,
        conversionRate: totalReferrals > 0 ? (activeReferrals / totalReferrals * 100).toFixed(1) : 0
      },
      monthlyStats
    });

  } catch (error) {
    next(error);
  }
};

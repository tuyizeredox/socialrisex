import User from '../models/User.js';
import Video from '../models/Video.js';
import Withdrawal from '../models/Withdrawal.js';
import ErrorResponse from '../utils/errorResponse.js';

// Dashboard Stats
export const getStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      activeUsers,
      totalVideos,
      activeVideos,
      pendingWithdrawals,
      totalPointsArray
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Video.countDocuments(),
      Video.countDocuments({ isActive: true }),
      Withdrawal.countDocuments({ status: 'pending' }),
      User.aggregate([
        { $group: { _id: null, total: { $sum: '$points' } } }
      ])
    ]);

    res.json({
      totalUsers,
      activeUsers,
      totalVideos,
      activeVideos,
      pendingWithdrawals,
      totalPoints: totalPointsArray[0]?.total || 0
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
            { email: { $regex: search, $options: 'i' } }
          ]
        }
      : {};

    const total = await User.countDocuments(query);
    
    // Get users with referral counts
    const users = await User.aggregate([
      { $match: query },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'referredBy',
          as: 'referrals'
        }
      },
      {
        $addFields: {
          referralCount: { $size: '$referrals' }
        }
      },
      {
        $project: {
          password: 0,
          'referrals.password': 0
        }
      },
      { $sort: { createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit }
    ]);

    // Transform the data to ensure all fields exist
    const transformedUsers = users.map(user => ({
      ...user,
      referralCount: user.referralCount || 0,
      earnings: user.earnings || 0,
      points: user.points || 0,
      isActive: user.isActive || false
    }));

    res.json({
      users: transformedUsers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// Video Management
// Get all videos (admin)
export const getAdminVideos = async (req, res, next) => {
  try {
    const videos = await Video.find()
      .populate('addedBy', 'fullName email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      videos
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to extract YouTube ID from URL
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

// Create new video
export const createVideo = async (req, res, next) => {
  try {
    const { title, youtubeUrl, pointsReward, minimumWatchTime, isActive } = req.body;

    // Extract YouTube ID from URL
    const youtubeId = extractYoutubeId(youtubeUrl);
    if (!youtubeId) {
      throw new ErrorResponse('Invalid YouTube URL', 400);
    }

    // Check if video with this YouTube ID already exists
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
      addedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
};

// Update video
export const updateVideo = async (req, res, next) => {
  try {
    const { youtubeUrl } = req.body;
    let update = { ...req.body };

    // If YouTube URL is being updated, extract new YouTube ID
    if (youtubeUrl) {
      const youtubeId = extractYoutubeId(youtubeUrl);
      if (!youtubeId) {
        throw new ErrorResponse('Invalid YouTube URL', 400);
      }
      update.youtubeId = youtubeId;
    }

    const video = await Video.findByIdAndUpdate(
      req.params.id,
      update,
      { new: true, runValidators: true }
    );

    if (!video) {
      throw new ErrorResponse('Video not found', 404);
    }

    res.status(200).json({
      success: true,
      data: video
    });
  } catch (error) {
    next(error);
  }
};

// Delete video
export const deleteVideo = async (req, res, next) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      throw new ErrorResponse('Video not found', 404);
    }

    await video.deleteOne();
    res.status(200).json({
      success: true,
      data: {}
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
        pages: Math.ceil(total / limit)
      }
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
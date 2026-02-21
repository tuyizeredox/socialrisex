import Video from '../models/Video.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { getVideoDetails } from '../utils/youtubeService.js';
import WatchedVideo from '../models/WatchedVideo.js';

export const getVideos = async (req, res, next) => {
  try {
    const videos = await Video.find({ isActive: true }).lean();

    // Get watched videos for the current user
    const watchedVideos = await WatchedVideo.find({
      user: req.user._id
    });

    // Create a map of watched video IDs for quick lookup
    const watchedVideoMap = new Map(
      watchedVideos.map(watch => [watch.video.toString(), watch])
    );

    // Add watched status to each video
    const videosWithStatus = videos.map(video => ({
      ...video,
      watched: watchedVideoMap.has(video._id.toString()),
      completedAt: watchedVideoMap.get(video._id.toString())?.completedAt || null
    }));

    res.status(200).json(videosWithStatus);
  } catch (error) {
    next(error);
  }
};

export const getAvailableVideos = async (req, res, next) => {
  try {
    // Get watched videos for current user
    const watchedVideos = await WatchedVideo.find({ 
      user: req.user._id,
      completedAt: { $exists: true }
    });
    
    const watchedVideoIds = watchedVideos.map(watch => watch.video);

    // Find unwatched active videos
    const videos = await Video.find({
      isActive: true,
      _id: { $nin: watchedVideoIds }
    }).sort('-createdAt');

    res.status(200).json({
      success: true,
      data: videos
    });
  } catch (error) {
    next(error);
  }
};

export const completeVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { watchTime } = req.body;

    // Get video details first
    const video = await Video.findById(id);
    if (!video) {
      return next(new ErrorResponse('Video not found', 404));
    }

    try {
      // Use findOneAndUpdate with upsert to atomically create/update watch record
      // This is the safest approach to prevent race conditions
      const watchedVideo = await WatchedVideo.findOneAndUpdate(
        {
          user: req.user._id,
          video: id
        },
        {
          $set: {
            watchTime,
            completedAt: new Date(),
            pointsEarned: video.pointsReward
          }
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      // Update user points and earnings with the video reward
      const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        { $inc: { points: video.pointsReward, earnings: video.pointsReward } },
        { new: true }
      );

      res.status(200).json({
        success: true,
        pointsEarned: video.pointsReward,
        videoPoints: video.pointsReward,
        totalPoints: updatedUser.points,
        message: 'Points earned!'
      });
    } catch (upsertError) {
      // Handle E11000 duplicate key error gracefully
      // This can happen in race conditions where two requests hit simultaneously
      if (upsertError.code === 11000) {
        // Video was already completed - get current user data and return
        const user = await User.findById(req.user._id);
        const existingWatch = await WatchedVideo.findOne({
          user: req.user._id,
          video: id
        });

        return res.status(200).json({
          success: true,
          pointsEarned: 0,
          videoPoints: video.pointsReward,
          totalPoints: user.points,
          message: 'Video already completed'
        });
      }
      throw upsertError;
    }
  } catch (error) {
    console.error('Video completion error:', error);
    next(error);
  }
};

// Record video watch and award points
export const watchVideo = async (req, res, next) => {
  try {
    const video = await Video.findOne({ youtubeId: req.params.videoId });
    if (!video) {
      throw new ErrorResponse('Video not found', 404);
    }

    try {
      // Use findOneAndUpdate with upsert for atomic operation (prevents race condition)
      const watchedVideo = await WatchedVideo.findOneAndUpdate(
        {
          video: video._id,
          user: req.user._id
        },
        {
          $set: {
            completedAt: new Date(),
            pointsEarned: video.pointsReward
          }
        },
        {
          upsert: true,
          new: true,
          runValidators: true
        }
      );

      // Update user points and earnings
      const updatedUser = await User.findByIdAndUpdate(req.user._id, {
        $inc: { points: video.pointsReward, earnings: video.pointsReward }
      }, { new: true });

      res.status(200).json({
        success: true,
        points: video.pointsReward
      });
    } catch (watchError) {
      // Handle E11000 duplicate key error
      if (watchError.code === 11000) {
        return res.status(200).json({
          success: true,
          points: 0,
          message: 'Video already watched'
        });
      }
      throw watchError;
    }
  } catch (error) {
    next(error);
  }
};
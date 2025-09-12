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

    // Find video and check if already watched
    const watchedVideo = await WatchedVideo.findOne({
      video: id,
      user: req.user._id,
      completedAt: { $exists: true }
    });

    if (watchedVideo) {
      return res.status(200).json({
        success: true,
        message: 'Video already completed',
        pointsEarned: 0,
        videoPoints: watchedVideo.pointsEarned
      });
    }

    // Get video details
    const video = await Video.findById(id);
    if (!video) {
      return next(new ErrorResponse('Video not found', 404));
    }

    // Create new watch record
    const newWatchedVideo = await WatchedVideo.create({
      user: req.user._id,
      video: id,
      watchTime,
      completedAt: new Date(),
      pointsEarned: video.pointsReward
    });

    // Update user points
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $inc: { points: video.pointsReward } },
      { new: true }
    );

    res.status(200).json({
      success: true,
      pointsEarned: video.pointsReward,
      videoPoints: video.pointsReward,
      totalPoints: updatedUser.points
    });
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

    // Check if user has already watched this video
    const hasWatched = await WatchedVideo.findOne({
      video: video._id,
      user: req.user._id,
      completedAt: { $exists: true }
    });

    if (hasWatched) {
      throw new ErrorResponse('Video already watched', 400);
    }

    // Create watch record
    await WatchedVideo.create({
      user: req.user._id,
      video: video._id,
      completedAt: new Date(),
      pointsEarned: video.pointsReward
    });

    // Update user points
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { points: video.pointsReward }
    });

    res.status(200).json({
      success: true,
      points: video.pointsReward
    });
  } catch (error) {
    next(error);
  }
};
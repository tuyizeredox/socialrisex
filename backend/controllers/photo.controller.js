import Photo from '../models/Photo.js';
import PhotoShare from '../models/PhotoShare.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import multer from 'multer';
import { uploadImageToCloudinary, deleteImageFromCloudinary, extractPublicIdFromUrl } from '../utils/cloudinary.js';

// Configure multer for file uploads
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Admin endpoints

// Get all photos (admin)
export const getAllPhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find()
      .populate('uploadedBy', 'fullName email')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: photos
    });
  } catch (error) {
    next(error);
  }
};

// Create new photo (admin)
export const createPhoto = async (req, res, next) => {
  try {
    const { title, description, tags, isActive } = req.body;
    
    if (!req.file) {
      return next(new ErrorResponse('Image file is required', 400));
    }

    // Upload image to Cloudinary
    const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'photos');
    const imageUrl = uploadResult.secure_url;
    const cloudinaryPublicId = uploadResult.public_id;
    
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const photo = await Photo.create({
      title,
      description,
      imageUrl,
      cloudinaryPublicId, // Store Cloudinary public ID for future deletion
      tags: parsedTags,
      isActive: isActive !== 'false',
      uploadedBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: photo
    });
  } catch (error) {
    console.error('Photo upload error:', error);
    next(error);
  }
};

// Update photo (admin)
export const updatePhoto = async (req, res, next) => {
  try {
    const { title, description, tags, isActive } = req.body;
    const photoId = req.params.id;

    const photo = await Photo.findById(photoId);
    if (!photo) {
      return next(new ErrorResponse('Photo not found', 404));
    }

    const updateData = {
      title: title || photo.title,
      description: description || photo.description,
      tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : photo.tags,
      isActive: isActive !== undefined ? isActive !== 'false' : photo.isActive
    };

    // Update image if new file uploaded
    if (req.file) {
      // Delete old image from Cloudinary
      if (photo.cloudinaryPublicId) {
        await deleteImageFromCloudinary(photo.cloudinaryPublicId);
      }
      
      // Upload new image to Cloudinary
      const uploadResult = await uploadImageToCloudinary(req.file.buffer, 'photos');
      updateData.imageUrl = uploadResult.secure_url;
      updateData.cloudinaryPublicId = uploadResult.public_id;
    }

    const updatedPhoto = await Photo.findByIdAndUpdate(
      photoId,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'fullName email');

    res.status(200).json({
      success: true,
      data: updatedPhoto
    });
  } catch (error) {
    console.error('Photo update error:', error);
    next(error);
  }
};

// Delete photo (admin)
export const deletePhoto = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return next(new ErrorResponse('Photo not found', 404));
    }

    // Delete image from Cloudinary
    if (photo.cloudinaryPublicId) {
      await deleteImageFromCloudinary(photo.cloudinaryPublicId);
    }

    // Delete associated shares
    await PhotoShare.deleteMany({ photo: photo._id });

    await Photo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
    console.error('Photo delete error:', error);
    next(error);
  }
};

// Toggle photo status (admin)
export const togglePhotoStatus = async (req, res, next) => {
  try {
    const photo = await Photo.findById(req.params.id);
    if (!photo) {
      return next(new ErrorResponse('Photo not found', 404));
    }

    photo.isActive = !photo.isActive;
    await photo.save();

    res.status(200).json({
      success: true,
      data: photo
    });
  } catch (error) {
    next(error);
  }
};

// Get photo statistics (admin)
export const getPhotoStats = async (req, res, next) => {
  try {
    const totalPhotos = await Photo.countDocuments();
    const activePhotos = await Photo.countDocuments({ isActive: true });
    const totalShares = await PhotoShare.countDocuments();
    const totalRwfPaid = await PhotoShare.aggregate([
      { $group: { _id: null, total: { $sum: '$rwfEarned' } } }
    ]);

    const stats = {
      totalPhotos,
      activePhotos,
      totalShares,
      totalRwfPaid: totalRwfPaid[0]?.total || 0
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// User endpoints

// Get available photos for sharing (user)
export const getAvailablePhotos = async (req, res, next) => {
  try {
    const photos = await Photo.find({ isActive: true })
      .select('title description imageUrl tags')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: photos
    });
  } catch (error) {
    next(error);
  }
};

// Share photo (user)
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

// Get user's photo shares (user)
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
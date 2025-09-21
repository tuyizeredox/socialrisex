import Photo from '../models/Photo.js';
import PhotoShare from '../models/PhotoShare.js';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/photos/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `photo-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

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

    // Convert relative URLs to full URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photosWithFullUrls = photos.map(photo => {
      return {
        ...photo.toObject(),
        imageUrl: photo.imageUrl.startsWith('http') ? photo.imageUrl : `${baseUrl}${photo.imageUrl}`
      };
    });

    res.status(200).json({
      success: true,
      data: photosWithFullUrls
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

    const imageUrl = `/uploads/photos/${req.file.filename}`;
    const parsedTags = tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [];

    const photo = await Photo.create({
      title,
      description,
      imageUrl,
      tags: parsedTags,
      isActive: isActive !== 'false',
      uploadedBy: req.user._id
    });

    // Convert relative URL to full URL for response
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photoWithFullUrl = {
      ...photo.toObject(),
      imageUrl: photo.imageUrl.startsWith('http') ? photo.imageUrl : `${baseUrl}${photo.imageUrl}`
    };

    res.status(201).json({
      success: true,
      data: photoWithFullUrl
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
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
      // Delete old image file
      const oldImagePath = path.join(process.cwd(), photo.imageUrl);
      if (fs.existsSync(oldImagePath)) {
        fs.unlink(oldImagePath, () => {});
      }
      updateData.imageUrl = `/uploads/photos/${req.file.filename}`;
    }

    const updatedPhoto = await Photo.findByIdAndUpdate(
      photoId,
      updateData,
      { new: true, runValidators: true }
    ).populate('uploadedBy', 'fullName email');

    // Convert relative URL to full URL for response
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photoWithFullUrl = {
      ...updatedPhoto.toObject(),
      imageUrl: updatedPhoto.imageUrl.startsWith('http') ? updatedPhoto.imageUrl : `${baseUrl}${updatedPhoto.imageUrl}`
    };

    res.status(200).json({
      success: true,
      data: photoWithFullUrl
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }
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

    // Delete image file
    const imagePath = path.join(process.cwd(), photo.imageUrl);
    if (fs.existsSync(imagePath)) {
      fs.unlink(imagePath, () => {});
    }

    // Delete associated shares
    await PhotoShare.deleteMany({ photo: photo._id });

    await Photo.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Photo deleted successfully'
    });
  } catch (error) {
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

    // Convert relative URLs to full URLs
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const photosWithFullUrls = photos.map(photo => {
      return {
        ...photo.toObject(),
        imageUrl: photo.imageUrl.startsWith('http') ? photo.imageUrl : `${baseUrl}${photo.imageUrl}`
      };
    });

    res.status(200).json({
      success: true,
      data: photosWithFullUrls
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

    // Create share record
    const photoShare = await PhotoShare.create({
      user: userId,
      photo: photoId,
      platform: platform || 'whatsapp',
      rwfEarned: 50
    });

    // Update photo share count
    await Photo.findByIdAndUpdate(photoId, {
      $inc: { shareCount: 1, totalRwfPaid: 50 }
    });

    // Update user points/earnings
    await User.findByIdAndUpdate(userId, {
      $inc: { points: 50, earnings: 50 }
    });

    res.status(201).json({
      success: true,
      data: photoShare,
      message: 'Photo shared successfully! You earned 50 RWF!'
    });
  } catch (error) {
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
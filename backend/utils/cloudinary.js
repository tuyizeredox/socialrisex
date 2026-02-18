import cloudinary from '../config/cloudinary.js';
import { Readable } from 'stream';

/**
 * Upload image to Cloudinary
 * @param {Buffer} buffer - Image buffer
 * @param {string} folder - Cloudinary folder name
 * @param {string} publicId - Public ID for the image
 * @returns {Promise<Object>} Upload result with secure_url
 */
export const uploadImageToCloudinary = async (buffer, folder = 'photos', publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: folder,
      resource_type: 'image',
      transformation: [
        { width: 1200, height: 800, crop: 'fill' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    // Convert buffer to readable stream
    const bufferStream = new Readable();
    bufferStream.push(buffer);
    bufferStream.push(null);
    bufferStream.pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} Deletion result
 */
export const deleteImageFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result;
  } catch (error) {
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract public ID from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} Public ID or null if not found
 */
export const extractPublicIdFromUrl = (url) => {
  if (!url) return null;
  
  // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/photo-1234567890.jpg
  const matches = url.match(/\/([^\/]+)\.(jpg|jpeg|png|gif|webp|avif)$/);
  if (matches && matches[1]) {
    return matches[1];
  }
  
  // Handle versioned URLs
  const versionedMatches = url.match(/\/v\d+\/([^\/]+)\.(jpg|jpeg|png|gif|webp|avif)$/);
  if (versionedMatches && versionedMatches[1]) {
    return versionedMatches[1];
  }
  
  return null;
};
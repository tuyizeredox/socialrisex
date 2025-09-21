import express from 'express';
import {
  getAllPhotos,
  createPhoto,
  updatePhoto,
  deletePhoto,
  togglePhotoStatus,
  getPhotoStats,
  getAvailablePhotos,
  sharePhoto,
  getUserPhotoShares,
  upload
} from '../controllers/photo.controller.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.get('/available', protect, getAvailablePhotos);
router.post('/share', protect, sharePhoto);
router.get('/user-shares', protect, getUserPhotoShares);

// Admin routes
router.get('/admin', protect, admin, getAllPhotos);
router.post('/admin', protect, admin, upload.single('image'), createPhoto);
router.put('/admin/:id', protect, admin, upload.single('image'), updatePhoto);
router.delete('/admin/:id', protect, admin, deletePhoto);
router.patch('/admin/:id/toggle-status', protect, admin, togglePhotoStatus);
router.get('/admin/stats', protect, admin, getPhotoStats);

export default router;
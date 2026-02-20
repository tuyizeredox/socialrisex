import express from 'express';
import { protect, adminCheck } from '../middleware/auth.middleware.js';

// Import controllers
import * as authController from '../controllers/auth.controller.js';
import * as userController from '../controllers/user.controller.js';
import * as videoController from '../controllers/video.controller.js';
import * as withdrawalController from '../controllers/withdrawal.controller.js';
import * as adminController from '../controllers/admin.controller.js';
import * as photoController from '../controllers/photo.controller.js';
import adminRoutes from './admin.routes.js';

const router = express.Router();

// Public routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Protected routes
router.use(protect); // Apply auth middleware to all routes below

// Auth routes
router.get('/auth/me', authController.getMe);
router.post('/auth/submit-transaction', authController.submitTransaction);
router.get('/auth/test', (req, res) => res.json({ message: 'Route update works!' }));

// User routes
router.get('/users/profile', userController.getProfile);
router.put('/users/profile', userController.updateProfile);
router.get('/users/stats', userController.getUserStats);
router.get('/users/watched-videos', userController.getWatchedVideos);
router.get('/users/referrals', userController.getReferrals);
router.get('/users/leaderboard', userController.getLeaderboard);
router.get('/users/referral-info', userController.getReferralInfo);
router.get('/users/pending-activation', userController.checkPendingActivation);
router.post('/users/activate', userController.activateAccount);
router.post('/users/share-photo', userController.sharePhoto);
router.get('/users/photo-shares', userController.getUserPhotoShares);
router.get('/users/bonus-history', userController.getBonusHistory);

// Video routes
router.get('/videos', videoController.getVideos);
router.get('/videos/available', videoController.getAvailableVideos);
router.post('/videos/:id/complete', videoController.completeVideo);

// Photo routes
router.get('/photos/available', photoController.getAvailablePhotos);

// Withdrawal routes
router.get('/withdrawals', withdrawalController.getUserWithdrawals);
router.post('/withdrawals', withdrawalController.createWithdrawal);

// Admin routes
router.use('/admin', adminRoutes);

export default router;

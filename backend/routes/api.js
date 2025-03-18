import express from 'express';
import { protect } from '../middleware/auth.js';
import { adminCheck } from '../middleware/auth.middleware.js';

// Import controllers
import * as authController from '../controllers/auth.controller.js';
import * as userController from '../controllers/user.controller.js';
import * as videoController from '../controllers/video.controller.js';
import * as withdrawalController from '../controllers/withdrawal.controller.js';
import * as adminController from '../controllers/admin.controller.js';

const router = express.Router();

// Public routes
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

// Protected routes
router.use(protect); // Apply auth middleware to all routes below

// Auth routes
router.get('/auth/me', authController.getMe);

// User routes
router.get('/users/profile', userController.getProfile);
router.put('/users/profile', userController.updateProfile);
router.get('/users/stats', userController.getUserStats);
router.get('/users/watched-videos', userController.getWatchedVideos);
router.get('/users/referrals', userController.getReferrals);
router.get('/users/referral-info', userController.getReferralInfo);
router.post('/users/activate', userController.activateAccount);

// Video routes
router.get('/videos', videoController.getVideos);
router.get('/videos/available', videoController.getAvailableVideos);
router.post('/videos/:id/complete', videoController.completeVideo);

// Withdrawal routes
router.get('/withdrawals', withdrawalController.getUserWithdrawals);
router.post('/withdrawals', withdrawalController.createWithdrawal);

// Admin routes
router.use('/admin', adminCheck); // Apply admin check middleware to all admin routes
router.get('/admin/stats', adminController.getStats);
router.get('/admin/users', adminController.getUsers);
router.put('/admin/users/:id', adminController.updateUser);
router.delete('/admin/users/:id', adminController.deleteUser); // New DELETE route for deleting users

// Admin video routes
router.get('/admin/videos', adminController.getAdminVideos);
router.post('/admin/videos', adminController.createVideo);
router.put('/admin/videos/:id', adminController.updateVideo);
router.delete('/admin/videos/:id', adminController.deleteVideo);

// Admin withdrawal routes
router.get('/admin/withdrawals', withdrawalController.getAllWithdrawals);
router.get('/admin/withdrawals/pending', withdrawalController.getPendingWithdrawals);
router.put('/admin/withdrawals/:id', withdrawalController.processWithdrawal);

export default router;

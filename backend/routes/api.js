import express from 'express';
import { protect, adminCheck } from '../middleware/auth.middleware.js';

// Import controllers
import * as authController from '../controllers/auth.controller.js';
import * as userController from '../controllers/user.controller.js';
import * as videoController from '../controllers/video.controller.js';
import * as withdrawalController from '../controllers/withdrawal.controller.js';
import * as adminController from '../controllers/admin.controller.js';
import * as photoController from '../controllers/photo.controller.js';

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
router.get('/users/referral-info', userController.getReferralInfo);
router.get('/users/pending-activation', userController.checkPendingActivation);
router.post('/users/activate', userController.activateAccount);
router.post('/users/share-photo', userController.sharePhoto);
router.get('/users/photo-shares', userController.getUserPhotoShares);

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

// Admin transaction routes
router.get('/admin/transactions', adminController.getPendingTransactions);
router.get('/admin/transactions/:id', adminController.getTransactionDetails);
router.put('/admin/transactions/:id', adminController.processTransaction);

// Admin leaderboard routes
router.get('/admin/leaderboard', adminController.getLeaderboard);
router.get('/admin/referrers/:userId', adminController.getReferrerDetails);

// Admin photo routes
router.get('/admin/photos', photoController.getAllPhotos);
router.post('/admin/photos', photoController.upload.single('image'), photoController.createPhoto);
router.put('/admin/photos/:id', photoController.upload.single('image'), photoController.updatePhoto);
router.delete('/admin/photos/:id', photoController.deletePhoto);
router.patch('/admin/photos/:id/toggle-status', photoController.togglePhotoStatus);
router.get('/admin/photo-stats', photoController.getPhotoStats);

// Admin multilevel earnings routes
router.get('/admin/multilevel-earnings', adminController.getMultilevelEarnings);
router.get('/admin/multilevel-earnings/stats', adminController.getMultilevelEarningsStats);
router.put('/admin/multilevel-earnings/:userId', adminController.updateUserMultilevelEarnings);
router.post('/admin/multilevel-earnings/recalculate', adminController.recalculateAllMultilevelEarnings);

export default router;

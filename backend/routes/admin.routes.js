import express from 'express';
import { 
  getStats,
  getUsers,
  updateUser,
  deleteUser,
  bulkDeleteUsers,
  getAdminVideos,
  createVideo,
  updateVideo,
  deleteVideo,
  getPendingWithdrawals,
  updateWithdrawal,
  getPendingTransactions,
  processTransaction,
  getTransactionDetails,
  exportTransactions,
  getLeaderboard,
  exportLeaderboard,
  getReferrerDetails,
  getMultilevelEarnings,
  updateUserMultilevelEarnings,
  editUserMultilevelEarnings,
  recalculateAllMultilevelEarnings,
  getMultilevelEarningsStats,
  getBonusTransactions,
  addBonusToUser,
  getBonusTransaction,
  updateBonusTransaction,
  getBonusStats,
  ensureAllUsersHaveEarnings
} from '../controllers/admin.controller.js';
import * as photoController from '../controllers/photo.controller.js';
import * as withdrawalController from '../controllers/withdrawal.controller.js';
import { protect, adminCheck } from '../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);
router.use(adminCheck);

// Dashboard stats
router.get('/stats', getStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.post('/users/bulk-delete', bulkDeleteUsers);
router.delete('/users/:id', deleteUser);

// Video Management
router.get('/videos', getAdminVideos);
router.post('/videos', createVideo);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

// Withdrawal Management
router.get('/withdrawals', withdrawalController.getAllWithdrawals);
router.get('/withdrawals/pending', getPendingWithdrawals);
router.put('/withdrawals/:id', withdrawalController.processWithdrawal);

// Transaction Management
router.get('/transactions', getPendingTransactions);
router.get('/transactions/export', exportTransactions);
router.get('/transactions/:id', getTransactionDetails);
router.put('/transactions/:id', processTransaction);

// Leaderboard Management
router.get('/leaderboard', getLeaderboard);
router.get('/leaderboard/export', exportLeaderboard);
router.get('/referrers/:userId', getReferrerDetails);

// Multilevel Earnings Management
router.get('/multilevel-earnings', getMultilevelEarnings);
router.get('/multilevel-earnings/stats', getMultilevelEarningsStats);
router.put('/multilevel-earnings/:userId', updateUserMultilevelEarnings);
router.put('/multilevel-earnings/:userId/edit', editUserMultilevelEarnings);
router.post('/multilevel-earnings/recalculate-all', recalculateAllMultilevelEarnings);
router.post('/multilevel-earnings/ensure-all-users', ensureAllUsersHaveEarnings);

// Bonus Management
router.get('/bonus-transactions', getBonusTransactions);
router.get('/bonus-transactions/stats', getBonusStats);
router.post('/bonus-transactions', addBonusToUser);
router.get('/bonus-transactions/:id', getBonusTransaction);
router.put('/bonus-transactions/:id', updateBonusTransaction);

// Photo Management
router.get('/photos', photoController.getAllPhotos);
router.post('/photos', photoController.upload.single('image'), photoController.createPhoto);
router.put('/photos/:id', photoController.upload.single('image'), photoController.updatePhoto);
router.delete('/photos/:id', photoController.deletePhoto);
router.patch('/photos/:id/toggle-status', photoController.togglePhotoStatus);
router.get('/photo-stats', photoController.getPhotoStats);

export default router; 
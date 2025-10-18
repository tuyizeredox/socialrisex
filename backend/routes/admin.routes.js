import express from 'express';
import { 
  getStats,
  getUsers,
  updateUser,
  deleteUser,
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
  recalculateAllMultilevelEarnings,
  getMultilevelEarningsStats,
  getBonusTransactions,
  addBonusToUser,
  getBonusTransaction,
  updateBonusTransaction,
  getBonusStats
} from '../controllers/admin.controller.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect);

// Dashboard stats
router.get('/stats', getStats);

// User Management
router.get('/users', getUsers);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

// Video Management
router.get('/videos', getAdminVideos);
router.post('/videos', createVideo);
router.put('/videos/:id', updateVideo);
router.delete('/videos/:id', deleteVideo);

// Withdrawal Management
router.get('/withdrawals', getPendingWithdrawals);
router.put('/withdrawals/:id', updateWithdrawal);

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
router.post('/multilevel-earnings/recalculate', recalculateAllMultilevelEarnings);

// Bonus Management
router.get('/bonus-transactions', getBonusTransactions);
router.get('/bonus-transactions/stats', getBonusStats);
router.post('/bonus-transactions', addBonusToUser);
router.get('/bonus-transactions/:id', getBonusTransaction);
router.put('/bonus-transactions/:id', updateBonusTransaction);

export default router; 
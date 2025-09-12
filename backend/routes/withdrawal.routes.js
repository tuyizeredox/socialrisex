import express from 'express';
import {
  createWithdrawal,
  getUserWithdrawals,
  getAllWithdrawals,
  getPendingWithdrawals,
  processWithdrawal
} from '../controllers/withdrawal.controller.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Protect all routes
router.use(protect);

// User routes
router.post('/', createWithdrawal);
router.get('/my-withdrawals', getUserWithdrawals);

// Admin routes - require admin role
router.get('/admin/all', authorize('admin'), getAllWithdrawals);
router.get('/admin/pending', authorize('admin'), getPendingWithdrawals);
router.put('/admin/:id', authorize('admin'), processWithdrawal);

export default router; 
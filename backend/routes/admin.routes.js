const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect, admin } = require('../middleware/auth.middleware');

// All routes are protected and require admin role
router.use(protect, admin);

// Dashboard
router.get('/dashboard/stats', adminController.getDashboardStats);

// Users
router.get('/users', adminController.getAllUsers);
router.get('/users/:userId', adminController.getUserDetails);

// Withdrawals
router.get('/withdrawals/pending', adminController.getPendingWithdrawals);
router.put('/withdrawals/:withdrawalId', adminController.handleWithdrawal);

module.exports = router; 
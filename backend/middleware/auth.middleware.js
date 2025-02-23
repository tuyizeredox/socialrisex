import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

export const protect = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      throw new ErrorResponse('No authentication token, access denied', 401);
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Modified query to handle projection properly
    const user = await User.findById(decoded.id)
      .select('fullName email role isActive referralCode referralCount earnings')
      .lean();

    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    req.user = user;
    next();
  } catch (error) {
    next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

export const adminCheck = async (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    next(new ErrorResponse('Not authorized as admin', 403));
  }
};

export const activeUser = async (req, res, next) => {
  if (req.user && req.user.isActive) {
    next();
  } else {
    next(new ErrorResponse('Account not activated', 403));
  }
};
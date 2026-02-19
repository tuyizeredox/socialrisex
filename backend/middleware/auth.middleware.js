import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

export const protect = async (req, res, next) => {
  try {
    // Read authorization header (handle varying header casing)
    const authHeader = req.headers.authorization || req.headers.Authorization;

    if (!authHeader || typeof authHeader !== 'string' || !authHeader.startsWith('Bearer ')) {
      return next(new ErrorResponse('No authentication token, access denied', 401));
    }

    const token = authHeader.replace('Bearer ', '').trim();

    // Verify token and return specific JWT errors when possible
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      const message = err && err.message ? err.message : 'Token verification failed';
      return next(new ErrorResponse(message, 401));
    }

    const user = await User.findById(decoded.id)
      .select('+fullName +email +role +isActive +referralCode +referralCount +earnings +points +mobileNumber')
      .lean()
      .exec();

    if (!user) {
      return next(new ErrorResponse('User not found', 404));
    }

    // Remove sensitive fields
    delete user.__v;
    delete user.password;

    req.user = user;
    return next();
  } catch (error) {
    // If an ErrorResponse was thrown earlier, forward it
    if (error instanceof ErrorResponse) return next(error);
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
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

export const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Optimize query by selecting only needed fields
      const user = await User.findById(decoded.id)
        .select('fullName email role isActive referralCode referralCount earnings points mobileNumber')
        .lean()
        .cache(300); // Cache for 5 minutes

      if (!user) {
        return next(new ErrorResponse('User not found', 404));
      }

      req.user = user;
      next();
    } catch (error) {
      return next(new ErrorResponse('Invalid token', 401));
    }
  } catch (error) {
    next(new ErrorResponse('Authentication error', 401));
  }
};

export default protect;
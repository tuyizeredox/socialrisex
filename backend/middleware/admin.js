import ErrorResponse from '../utils/errorResponse.js';

// Export as named export
export const admin = (req, res, next) => {
  // Check if user exists and has role property
  if (!req.user || !req.user.role) {
    return next(new ErrorResponse('User not authenticated', 401));
  }

  // Check if user is admin
  if (req.user.role !== 'admin') {
    return next(new ErrorResponse('Not authorized as admin', 403));
  }

  next();
};

// Also export as default if needed
export default admin; 
import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';

// Middleware to protect routes by verifying JWT authentication token.
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.jwt;

    if (!token) {
      res.statusCode = 401;
      throw new Error('Authentication failed: Token not provided.');
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    if (!decodedToken) {
      res.statusCode = 401;
      throw new Error('Authentication failed: Invalid token.');
    }

    req.user = await User.findById(decodedToken.userId).select('-password');

    if (!req.user) {
      res.statusCode = 401;
      throw new Error('Authentication failed: User no longer exists.');
    }

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if the user is an admin.
const admin = (req, res, next) => {
  try {
    if (!req.user || (!req.user.isAdmin && req.user.role !== 'admin')) {
      res.statusCode = 403;
      throw new Error('Authorization failed: Not authorized as an admin.');
    }
    next();
  } catch (error) {
    next(error);
  }
};

// Middleware to check if the user is a seller or admin.
const seller = (req, res, next) => {
  try {
    if (!req.user || (req.user.role !== 'seller' && req.user.role !== 'admin' && !req.user.isAdmin)) {
      res.statusCode = 403;
      throw new Error('Authorization failed: Only sellers or admins can perform this action.');
    }
    next();
  } catch (error) {
    next(error);
  }
};

export { protect, admin, seller };

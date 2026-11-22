import User from '../models/userModel.js';
import Notification from '../models/notificationModel.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { generateToken } from '../utils/generateToken.js';
import transporter from '../config/email.js';

// @desc     Auth user & get token
// @method   POST
// @endpoint /api/v1/users/login
// @access   Public
const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      res.statusCode = 404;
      throw new Error(
        'Invalid email address. Please check your email and try again.'
      );
    }

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      res.statusCode = 401;
      throw new Error(
        'Invalid password. Please check your password and try again.'
      );
    }

    generateToken(req, res, user._id);

    const userRole = user.role || (user.isAdmin ? 'admin' : 'buyer');

    res.status(200).json({
      message: 'Login successful.',
      _id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      isAdmin: user.isAdmin || userRole === 'admin',
      wonCount: user.wonCount || 0,
      avgRating: user.avgRating || 5.0
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Register user
// @method   POST
// @endpoint /api/v1/users
// @access   Public
const registerUser = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;

    const userExists = await User.findOne({ email });

    if (userExists) {
      res.statusCode = 409;
      throw new Error('User already exists. Please choose a different email.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const assignedRole = role === 'seller' ? 'seller' : role === 'admin' ? 'admin' : 'buyer';
    const isAdmin = assignedRole === 'admin';

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
      isAdmin
    });

    await user.save();

    generateToken(req, res, user._id);

    res.status(201).json({
      message: 'Registration successful. Welcome to SmartBid!',
      _id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      wonCount: 0,
      avgRating: 5.0
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Logout user / clear cookie
// @method   POST
// @endpoint /api/v1/users/logout
// @access   Private
const logoutUser = (req, res) => {
  res.clearCookie('jwt', { httpOnly: true });
  res.status(200).json({ message: 'Logout successful' });
};

// @desc     Get user profile
// @method   GET
// @endpoint /api/v1/users/profile
// @access   Private
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found!');
    }

    const userRole = user.role || (user.isAdmin ? 'admin' : 'buyer');

    res.status(200).json({
      message: 'User profile retrieved successfully',
      _id: user._id,
      userId: user._id,
      name: user.name,
      email: user.email,
      role: userRole,
      isAdmin: user.isAdmin,
      wonCount: user.wonCount || 0,
      avgRating: user.avgRating || 5.0,
      totalSales: user.totalSales || 0
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Update user profile
// @method   PUT
// @endpoint /api/v1/users/profile
// @access   Private
const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.role && ['buyer', 'seller'].includes(req.body.role)) {
      user.role = req.body.role;
    }

    if (req.body.password) {
      user.password = await bcrypt.hash(req.body.password, 10);
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User profile updated successfully',
      _id: updatedUser._id,
      userId: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isAdmin: updatedUser.isAdmin,
      wonCount: updatedUser.wonCount || 0,
      avgRating: updatedUser.avgRating || 5.0
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Get all users (admin)
// @method   GET
// @endpoint /api/v1/users
// @access   Private/Admin
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password');
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

// @desc     Get user by ID (admin)
// @method   GET
// @endpoint /api/v1/users/:id
// @access   Private/Admin
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc     Update user by ID (admin)
// @method   PUT
// @endpoint /api/v1/users/:id
// @access   Private/Admin
const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.role) user.role = req.body.role;
    if (typeof req.body.isAdmin === 'boolean') user.isAdmin = req.body.isAdmin;

    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      isAdmin: updatedUser.isAdmin
    });
  } catch (error) {
    next(error);
  }
};

// @desc     Delete user (admin)
// @method   DELETE
// @endpoint /api/v1/users/:id
// @access   Private/Admin
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found');
    }
    if (user.isAdmin) {
      res.statusCode = 400;
      throw new Error('Cannot delete admin user');
    }
    await User.deleteOne({ _id: user._id });
    res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc     Get all admins
// @method   GET
// @endpoint /api/v1/users/admins
// @access   Private/Admin
const admins = async (req, res, next) => {
  try {
    const adminUsers = await User.find({ isAdmin: true }).select('-password');
    res.status(200).json(adminUsers);
  } catch (error) {
    next(error);
  }
};

// @desc     Get user notifications
// @method   GET
// @endpoint /api/v1/users/notifications
// @access   Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('auction', 'name image currentHighestBid');
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
};

// @desc     Mark notification as read
// @method   PUT
// @endpoint /api/v1/users/notifications/:id/read
// @access   Private
const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { isRead: true },
      { new: true }
    );
    res.status(200).json(notification);
  } catch (error) {
    next(error);
  }
};

// Password reset requests
const resetPasswordRequest = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      res.statusCode = 404;
      throw new Error('User not found with this email');
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    res.status(200).json({ message: 'Password reset link sent to your email', token, userId: user._id });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    const { id, token } = req.params;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.userId !== id) {
      res.statusCode = 400;
      throw new Error('Invalid token');
    }
    const user = await User.findById(id);
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    next(error);
  }
};

export {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  admins,
  getNotifications,
  markNotificationRead,
  resetPasswordRequest,
  resetPassword
};

import express from 'express';
import {
  loginUser,
  registerUser,
  logoutUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  updateUser,
  getUserById,
  admins,
  resetPasswordRequest,
  resetPassword,
  getNotifications,
  markNotificationRead
} from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(registerUser)
  .get(protect, admin, getUsers);

router.route('/admins').get(protect, admin, admins);
router.post('/login', loginUser);
router.post('/logout', protect, logoutUser);

router.post('/reset-password/request', resetPasswordRequest);
router.post('/reset-password/reset/:id/:token', resetPassword);

router
  .route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);

router
  .route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

export default router;

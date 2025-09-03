import express from 'express';
import { register, login, getAllUsers, resetPassword, forgotPassword, updateUserPassword } from '../controller/authController.js';
import { authenticate } from '../utils/jwtUtills.js';
// import { resetPasswordLimiter } from '../utils/rateLimitToMail.js';
import { googleLogin } from '../utils/googleLoginAuth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// get all admin users from the database 
router.get("/admin/users", authenticate, getAllUsers);
// update user pass by admin
router.patch("/admin/users/:userId/password", authenticate, updateUserPassword);
// Google Authentication Route
router.post('/google-login', googleLogin);

// Profile Routes
// router.get('/profile/:id',authenticate, getProfileWithExpenses);

// router.get('/profile', authenticate, getProfile);
// @route   POST /api/auth/forgot-password
// @desc    Forgot password 
// @access  Public
router.post(
    '/forgot-password',forgotPassword);
  
  // @route   POST /api/auth/reset-password/:resetToken
  // @desc    Reset password
  // @access  Public
  router.post(
    '/reset-password/:resetToken', resetPassword
  );

  // router.post('/google', GoogleAuthHandler)


export default router;
 
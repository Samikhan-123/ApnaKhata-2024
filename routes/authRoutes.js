import express from 'express';
import { register, login, getAllUsers, resetPassword, forgotPassword, getProfileWithExpenses } from '../controller/authController.js';
import { authenticate } from '../utils/jwtUtills.js';
import { GoogleAuthHandler } from '../utils/googleLoginAuth.js';
import { resetPasswordLimiter } from '../utils/rateLimitToMail.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// get all users from the database
router.get('/users',authenticate, getAllUsers);

// get user profile by id
router.get('/profile/:id',authenticate, getProfileWithExpenses);

// router.get('/profile', authenticate, getProfile);
// @route   POST /api/auth/forgot-password
// @desc    Forgot password 
// @access  Public
router.post(
    '/forgot-password',resetPasswordLimiter,forgotPassword);
  
  // @route   POST /api/auth/reset-password/:resetToken
  // @desc    Reset password
  // @access  Public
  router.post(
    '/reset-password/:resetToken', resetPassword
  );
  
  router.post('/google', GoogleAuthHandler)


export default router;
 
import express from 'express';
import { register, login, getProfile, getAllUsers, resetPassword, forgotPassword } from '../controller/authController.js';
import { authenticate } from '../utils/jwtUtills.js';
import { check } from 'express-validator';
import { GoogleAuthHandler } from '../utils/googleLoginAuth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

// get all users from the database
router.get('/users',authenticate, getAllUsers);

// get user profile by id
router.get('/profile/:id',authenticate, getProfile);

// router.get('/profile', authenticate, getProfile);
// @route   POST /api/auth/forgot-password
// @desc    Forgot password 
// @access  Public
router.post(
    '/forgot-password',
    [check('email', 'Please include a valid email').isEmail()],
    forgotPassword
  );
  
  // @route   POST /api/auth/reset-password/:resetToken
  // @desc    Reset password
  // @access  Public
  router.post(
    '/reset-password/:resetToken',
    [check('password', 'Password must be at least 6 characters').isLength({ min: 6 })],
    resetPassword
  );

  router.post('/google', GoogleAuthHandler)


export default router;
 
import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { sendEmail } from "../utils/sendEmail.js";

dotenv.config();

// Register new user
export const register = async (req, res) => {
  try {
    // Destructure the request body
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    // Check if user already exists
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    // Check if username is provided and if it is unique
    if (name) {
      const existingUserByUsername = await User.findOne({ name });
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username is already in use." });
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    // Save new user to the database
    await newUser.save();

    // Respond with success
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Error registering user", error: error.message });
  }
};

// Login existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

    // Find user and explicitly select the password field
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }

    // Check if the user has a resetPasswordToken
    if (user.resetPasswordToken) {
      if (user.resetPasswordExpire > Date.now()) {
        return res.status(403).json({ message: "Please reset your password using the link sent to your email" });
      } else {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();
      }
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: "30d" });

    // Clear any existing reset tokens upon successful login
    if (user.resetPasswordToken) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
    }

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const userId = req.params.id; // Get user ID from route parameters
    const user = await User.findById(userId).select('-password'); 

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

// Get all users from the database
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); 
    res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Error fetching users', error: error.message });
  }
};

// forget password endpoint
export const forgotPassword = async (req, res) => {
    const { email } = req.body;
  
    try {
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Check if there's already a reset token and if it hasn't expired
      if (user.resetPasswordExpire && user.resetPasswordExpire > Date.now()) {
        return res.status(400).json({ message: 'A reset password request is already pending. Please check your email.' });
      }
  
      const resetToken = user.getResetPasswordToken();
      await user.save({ validateBeforeSave: false });
  
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
      const message = `You requested a password reset. Please use this link to reset your password: \n\n ${resetUrl}`;
  
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Request',
        message,
      });
  
      res.status(200).json({ message: 'Password reset email sent! - Expiration time 5 minutes' });
    } catch (error) {
      console.error('Detailed error in forgotPassword:', error);
      
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined; // Fixed typo here
        await user.save({ validateBeforeSave: false });
      }
  
      res.status(500).json({ 
        message: 'Error sending email. Please try again later.',
        error: error.message 
      });
    }
  };
  
  // ... implementation of reset password ...
// Reset Password
export const resetPassword = async (req, res) => {
    const { resetToken } = req.params;
    const { password } = req.body;
  
    // Hash the token to compare with DB
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  
    try {
      const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
  
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid or expired password reset token' });
      }
  
      // Set new password
      user.password = await bcrypt.hash(password, 10); // Hash new password
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save();
  
      // Send confirmation email
      await sendEmail({
        email: user.email,
        subject: 'Password Successfully Reset',
        message: `Hello,\n\nThis is a confirmation that the password for your account ${user.email} has just been changed.\n`,
      });
  
      res.status(200).json({
        success: true,
        message: 'Password has been reset successfully',
      });
    } catch (error) {
      console.error('Error resetting password:', error);
      res.status(500).json({ success: false, message: 'Server Error' });
    }
  };


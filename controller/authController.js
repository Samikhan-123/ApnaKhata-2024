// backend/controllers/userController.js
import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmail } from "../utils/emailConfig.js";
// import Expense from "../model/expenseSchema.js";
import {
  formatDate,
  passwordResetRequestTemplate,
  passwordResetSuccessTemplate,
  welcomeEmailTemplate,
} from "../utils/emailMessages.js";

dotenv.config();
// Password validation helper
const validatePassword = (password) => {
  const requirements = [];
  if (password.length < 8) requirements.push("at least 8 characters");
  if (!/[A-Z]/.test(password)) requirements.push("one uppercase letter");
  if (!/[a-z]/.test(password)) requirements.push("one lowercase letter");
  if (!/[0-9]/.test(password)) requirements.push("one number");
  if (!/[^A-Za-z0-9]/.test(password))
    requirements.push("one special character");
  return requirements;
};
// Registration Controller
export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Check if all required fields are present
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    // Validate password requirements
    const unmetRequirements = validatePassword(password);
    if (unmetRequirements.length) {
      return res.status(400).json({
        success: false,
        message: "Missing requirements: " + unmetRequirements.join(", "),
        requirements: unmetRequirements,
      });
    }

    // Check if email is already in use
    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    // Check if username is already in use
    // const existingUserByUsername = await User.findOne({ name });
    // if (existingUserByUsername) {
    //   return res.status(400).json({ message: "Username is already in use." });
    // }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const newUser = new User({
      name,
      email,
      password: hashedPassword, // Store the hashed password
    });

    await newUser.save();
    const welcomeEmail = welcomeEmailTemplate(
      newUser.name || "User",
      process.env.FRONTEND_URL || "https://apna-khata-2024.vercel.app/expenses"
    );

    await sendEmail({
      email: newUser.email,
      subject: "Welcome to ApnaKhata - Start Managing Your Expenses",
      html: welcomeEmail,
    });

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    // console.error('Error during registration:', error.message);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// Login Controller (Local Users)
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user by email and include password
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "user with this email not found.",
      });
    }

    // Check if it's a Google user trying to log in with password
    if (user.isGoogleUser) {
      return res.status(400).json({
        success: false,
        message: "Please use Google Sign-In for this account.",
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(403).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Generate JWT token and reset password fields if needed
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

    user.lastLogin = Date.now();
    await user.save();

    res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isGoogleUser: user.isGoogleUser,
      },
      token,
    });
  } catch (error) {
    // console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: "Error logging in.",
      error: error.message,
    });
  }
};

// Get Profile with Expenses Controller
// export const getProfileWithExpenses = async (req, res) => {
//   try {
//     const user = req.user; // User is already attached by the authenticate middleware

//     // Fetch expenses where the user is the payer
//     const expenses = await Expense.find({
//       "paidBy.userId": user._id, // Use dot notation to access nested fields
//     }).select("amount date description");

//     // Return user info including isGoogleUser
//     res.status(200).json({
//       user: { ...user.toObject(), isGoogleUser: user.isGoogleUser },
//       expenses,
//     });
//   } catch (error) {
//     // console.error('Error fetching profile with expenses:', error);
//     res.status(500).json({
//       message: "Error fetching profile",
//       error: error.message,
//     });
//   }
// };

// Get All Users with Admin Check
export const getAllUsers = async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.email !== "samikhan7816@gmail.com") {
      return res.status(403).json({
        success: false,
        message: "Admin email is required to access this resource",
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery = {};
    if (search) {
      searchQuery = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    const users = await User.find(searchQuery)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalUsers / limit);

    res.status(200).json({
      success: true,
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    });
  }
};

// Update User Password (Admin)
export const updateUserPassword = async (req, res) => {
  try {
    // Check if requester is admin
    if (req.user.email !== "samikhan7816@gmail.com") {
      return res.status(403).json({
        success: false,
        message: "Admin email is required to access this resource",
      });
    }

    const { userId } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password is required",
      });
    }
    var unmetRequirements = validatePassword(newPassword);
    if (unmetRequirements.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Password does not meet requirements: " +
          unmetRequirements.join(", "),
        requirements: unmetRequirements,
      });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Hash new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update user password
    user.password = hashedPassword;
    user.passwordChangedAt = new Date();
    user.passwordVersion = (user.passwordVersion || 0) + 1;
    await user.save();

    res.status(200).json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating password",
      error: error.message,
    });
  }
};

export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Validate email
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        message: "Please provide a valid email address",
      });
    }

    // Find user by email
    const user = await User.findOne({ email }).select("+passwordResetAttempts");

    if (!user) {
      return res.status(400).json({
        message:
          "User with this email does not exist. Please check and try again.",
      });
    }

    // Check if Google user
    if (user.isGoogleUser) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please use Google to access your account.",
        isGoogleUser: true,
      });
    }

    // Rate limiting: max 3 requests per hour
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    if (
      user.passwordResetAttempts >= 3 &&
      user.resetPasswordExpire > oneHourAgo
    ) {
      return res.status(429).json({
        message:
          "You have exceeded the maximum number of password reset attempts. Please try again later (1 hour limit).",
      });
    }

    // Generate reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    // Update user with reset token
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;
    await user.save();

    // Create reset URL
    const resetUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
      : `https://apna-khata-2024.vercel.app/reset-password/${resetToken}`;
    console.log(process.env.FRONTEND_URL);
    console.log("Reset URL:", resetUrl);
    console.log("Email message:", message);
    // Format date and create email message
    const formattedDate = formatDate(new Date());
    const message = passwordResetRequestTemplate(
      user.name,
      resetUrl,
      formattedDate
    );


    // Send email
    const emailSent = await sendEmail({
      email: user.email,
      subject: "Password Reset Request - ApnaKhata",
      html: message,
    });

    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to send password reset email. Please try again later.",
      });
    }

    res.status(200).json({
      success: true,
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({
      message:
        "An error occurred while processing your request. Please try again later.",
    });
  }
};

export const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  try {
    // Validate input
    if (!password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Both password fields are required.",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Validate password strength
    const unmetRequirements = validatePassword(password);
    if (unmetRequirements.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Password does not meet requirements: " +
          unmetRequirements.join(", "),
        requirements: unmetRequirements,
      });
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
        code: "TOKEN_EXPIRED",
      });
    }

    // Find user with valid reset token
    const user = await User.findOne({
      _id: decoded.userId,
      resetPasswordToken: resetToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+password");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Password reset token is invalid or has expired.",
        code: "TOKEN_EXPIRED",
      });
    }

    // Hash new password and update user
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt = new Date();
    user.passwordVersion = (user.passwordVersion || 0) + 1;
    await user.save();

    // Send confirmation email
    try {
      const formattedDate = formatDate(new Date());
      const message = passwordResetSuccessTemplate(
        user.name || "User",
        formattedDate
      );

      await sendEmail({
        email: user.email,
        subject: "Password Reset Successful - ApnaKhata",
        html: message,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email:", emailError);
      // Continue with success response even if email fails
    }

    res.status(200).json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    // console.error("Reset password error:", error);

    res.status(500).json({
      success: false,
      message:
        "An error occurred while resetting the password. Please try again.",
    });
  }
};

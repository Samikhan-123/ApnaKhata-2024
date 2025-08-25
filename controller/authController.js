// backend/controllers/userController.js
import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { sendEmail } from "../utils/emailConfig.js";
import Expense from "../model/expenseSchema.js";

dotenv.config();

// Password validation function
export const validatePassword = (password) => {
  const requirements = [];

  if (!/[A-Z]/.test(password)) {
    requirements.push("one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    requirements.push("one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    requirements.push("one number");
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    requirements.push("one special character e.g. !@#$%^&*");
  }

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
export const getProfileWithExpenses = async (req, res) => {
  try {
    const user = req.user; // User is already attached by the authenticate middleware

    // Fetch expenses where the user is the payer
    const expenses = await Expense.find({
      "paidBy.userId": user._id, // Use dot notation to access nested fields
    }).select("amount date description");

    // Return user info including isGoogleUser
    res.status(200).json({
      user: { ...user.toObject(), isGoogleUser: user.isGoogleUser },
      expenses,
    });
  } catch (error) {
    // console.error('Error fetching profile with expenses:', error);
    res.status(500).json({
      message: "Error fetching profile",
      error: error.message,
    });
  }
};

// Get All Users Controller
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    // console.error('Error fetching users:', error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// Forgot Password Controller
// Forgot Password Controller
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  let user = null;
  try {
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }
    user = await User.findOne({ email }).select("+passwordResetAttempts");
    if (!user) {
      return res
        .status(400)
        .json({ message: "user with this email not found." });
    }
    if (user.isGoogleUser) {
      return res.status(400).json({
        success: false,
        message:
          "This account uses Google Sign-In. Please use Google to access your account.",
        isGoogleUser: true,
      });
    }
    // Generate JWT token for password reset
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    user.sendEmailsOnForgetPass = (user.passwordResetAttempts || 0) + 1;
    await user.save();
    const resetUrl = process.env.FRONTEND_URL
      ? `${process.env.FRONTEND_URL}/reset-password/${resetToken}`
      : `http://localhost:5173/reset-password/${resetToken}`;
    const formatDate = (date) => {
      return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Karachi",
      }).format(date);
    };
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    const message = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
        <h2 style="color: #333;">Dear ${user.name},</h2>
        <p>You have requested to reset your password on <span 
        style="
         font-size: .7rem; 
         font-weight: 500; 
         color: #333; 
         background-color: #f2f2f2; 
         padding: 4px 8px; 
         border-radius: 4px; 
         border: 1px solid #ddd;"
         >
        ${formattedDate}
         </span>
       <br><br>
       Please use the following link to set a new password:</p> 
        <p>
          <a href="${resetUrl}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
            Reset Password
          </a>
        </p>
        <p style="color: #666;">
          This link will expire in 10 minutes for security reasons.
        </p>
        <p>If you did not request this password reset, please ignore this email and ensure your account is secure.</p>
          <div style="margin-top: 20px; font-size: 0.9em; color: #777; ">
              <p>Best Regards,</p>
              <p>ApnaKhata Expense Tracker</p>
            </div>
      </div>
    `;
    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html: message,
    });
    // console.log(`Forgot Email sent to ${user.email}`);
    res.status(200).json({
      success: true,
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    if (user) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });
    }
    res.status(500).json({
      message: "An error occurred while processing your request, server error.",
    });
  }
};

// Reset Password Controller
export const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  if (!password || !confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Both password fields are required." });
  }
  if (password !== confirmPassword) {
    return res
      .status(400)
      .json({ success: false, message: "Passwords do not match." });
  }
  const unmetRequirements = validatePassword(password);
  if (unmetRequirements.length) {
    return res.status(400).json({
      success: false,
      message: "Missing requirements: " + unmetRequirements.join(" "),
      requirements: unmetRequirements,
    });
  }
  try {
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
    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.passwordChangedAt = new Date();
    user.passwordVersion = (user.passwordVersion || 0) + 1;
    await user.save();
    const formatDate = (date) => {
      return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Karachi",
      }).format(date);
    };
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    const message = `
      <h1>Your Password Has Been Successfully Reset</h1>
      <p>Dear ${user.name || "User"},</p>
      <p>Your password was successfully changed on  <span 
        style="
         font-size: .7rem; 
         font-weight: 500; 
         color: #333; 
         background-color: #f2f2f2; 
         padding: 4px 8px; 
         border-radius: 4px; 
         border: 1px solid #ddd;"
         >
        ${formattedDate}
         </span>
         </p>
        <p>If you did not request this change, please take action to secure your account immediately.</p>
       <h3>Security Tips:</h3>
       <ul>
        <li>Use a strong password that is at least 8 characters long.</li>
        <li>Avoid using common words or easily guessable information.</li>
      </ul>
      <p>Thank you for using our service!</p>
               <div style="margin-top: 20px; font-size: 0.9em; color: #777; ">
              <p>Best Regards,</p>
              <p>ApnaKhata Expense Tracker</p>
            </div>
    `;
    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Confirmation",
        html: message,
      });
    } catch (error) {
      // Email failure does not block password reset
    }
    res.status(200).json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "An error occurred while resetting the password.",
    });
  }
};

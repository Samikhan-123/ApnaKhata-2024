import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import { logger } from "../utils/Logger.js";
import Expense from "../model/expenseSchema.js";

dotenv.config();

// Function to validate password strength
export const validatePassword = (password) => {
  const requirements = [];
  const minLength = 6;

  if (password.length < minLength) {
    requirements.push(
      `Password must be at least ${minLength} characters long.`
    );
  }
  if (!/[A-Z]/.test(password)) {
    requirements.push("Password must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    requirements.push("Password must contain at least one lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    requirements.push("Password must contain at least one number.");
  }
  // Uncomment if you want to enforce special characters
  // if (!/[!@#$%^&*]/.test(password)) {
  //   requirements.push("Password must contain at least one special character.");
  // }

  return requirements;
};

// Register new user
export const register = async (req, res) => {
  try {
    // Destructure the request body
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }


    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    const unmetRequirements = validatePassword(password);
    if (unmetRequirements.length) {
      return res.status(400).json({
        success: false,
        message:
          "Please address the following requirements: " +
          unmetRequirements.join(" "),
        requirements: unmetRequirements,
      });
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
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

// Login existing user
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    // Find user and explicitly select the password field
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }

    // Check if the user has a resetPasswordToken
    // if (user.resetPasswordToken) {
    //   if (user.resetPasswordExpire > Date.now()) {
    //     return res.status(403).json({ message: "Please reset your password using the link sent to your email" });
    //   } else {
    //     user.resetPasswordToken = undefined;
    //     user.resetPasswordExpire = undefined;
    //     await user.save();
    //   }
    // }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

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
    console.error("Login error:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};


export const getProfileWithExpenses = async (req, res) => {
  try {
    const userId = req.params.id;

    // Fetch user profile excluding the password
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch expenses related to the user
    const expenses = await Expense.find({ "paidBy.userId": userId });

    res.status(200).json({ user, expenses });
  } catch (error) {
    console.error("Error fetching profile with expenses:", error);
    res.status(500).json({ message: "Error fetching profile", error: error.message });
  }
};


// Get all users from the database
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({ message: "Error fetching users", error: error.message });
  }
};

// // forget password endpoint
// export const forgotPassword = async (req, res) => {
//     const { email } = req.body;

//     try {
//       const user = await User.findOne({ email });

//       if (!user) {
//         return res.status(404).json({ message: 'User not found' });
//       }
//       // Generate a random token for resetting password
//       // const resetToken = crypto.randomBytes(20).toString('hex');
//       // const resetPasswordExpire = Date.now() + 500000; // 5 minutes
//       // user.resetPasswordToken = resetToken;
//       // user.resetPasswordExpire = resetPasswordExpire;
//       // await user.save({ validateBeforeSave: false });

//       // Create a URL with the reset token

//       const resetToken = crypto.randomBytes(20).toString('hex');

//   resetPasswordToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');

//   this.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // 10 minutes

//   return resetToken;
// };
//       // crypto.compareSync(resetToken, user.resetPasswordToken); // Check if the tokens match
//       // If tokens don't match, it means the user has tried to reset password more than once

//       // Check if there's already a reset token and if it hasn't expired
//       // if (user.resetPasswordExpire && user.resetPasswordExpire > Date.now()) {
//       //   return res.status(400).json({ message: 'A reset password request is already pending. Please check your email.' });
//       // }

//       // const resetToken = user.getResetPasswordToken();
//       // await user.save({ validateBeforeSave: false });

//       const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
//       const message = `You requested a password reset. Please use this link to reset your password: \n\n ${resetUrl}`;

//       await sendEmail({
//         email: user.email,
//         subject: 'Password Reset Request',
//         message,
//       });

//       res.status(200).json({ message: 'Password reset email sent! - Expiration time 5 minutes' });
//     } catch (error) {
//       console.error('Detailed error in forgotPassword:', error);

//       // if (user) {
//       //   user.resetPasswordToken = undefined;
//       //   user.resetPasswordExpire = undefined; // Fixed typo here
//       //   await user.save({ validateBeforeSave: false });
//       // }

//       res.status(500).json({
//         message: 'Error sending email. Please try again later.',
//         error: error.message
//       });
//     }
//   };

// import { rateLimiter } from '../middleware/rateLimiter.js';
// import { logger } from '../utils/logger.js';

export const forgotPassword = [
  // rateLimiter({ windowMs: 15 * 60 * 1000, max: 3 }), // Rate limit: 3 requests per 15 minutes
  async (req, res) => {
    const { email } = req.body;

    try {
      // Input validation
      if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        return res
          .status(400)
          .json({ message: "Please provide a valid email address" });
      }

      const user = await User.findOne({ email }).select(
        "+passwordResetAttempts"
      );

      if (!user) {
        logger.info(
          `Password reset attempted for non-existent email: ${email}`
        );
        // Send a generic response to prevent email enumeration
        return res.status(200).json({
          message:
            "If a user with that email exists, a password reset link has been sent.",
        });
      }

  

      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Hash the token for storage
      const hashedToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

      // Set token, expiration, and increment reset attempts
      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
      user.sendEmailsOnForgetPass = (user.passwordResetAttempts || 0) + 1;
      

      await user.save();
     

      // Create reset URL
      const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

      // Prepare email content
      const message = `
       <div style="font-family: Arial, sans-serif; line-height: 1.5; padding: 20px;">
    <h2 style="color: #333;">Dear ${user.name},</h2>
    
    <p>You have requested to reset your password. Please use the following link to set a new password:</p>
    
    <p>
      <a href="${resetUrl}" style="background-color: #28a745; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">
        Reset Password
      </a>
    </p>

    <p style="color: #666;">
      This link will expire in 10 minutes for security reasons.
    </p>

    <p>If you did not request this password reset, please ignore this email and ensure your account is secure.</p>

    <p>Best regards,<br>
    <strong>ApnaKhata Team</strong></p>
  </div>
`;

      // Send email
      await sendEmail({
        email: user.email,
        subject: "Password Reset Request",
        html: message,
      });

      logger.info(`Password reset email sent to user: ${user._id}`);

      // Send a generic response to prevent email enumeration
      res.status(200).json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
    } catch (error) {
      logger.error("Error in forgotPassword:", error);

      // Clear reset token fields in case of error
      if (user) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save({ validateBeforeSave: false });
      }

      res.status(500).json({
        message:
          "An error occurred while processing your request. Please try again later.",
      });
    }
  },
];

// ... implementation of reset password ...
// Reset Password
// resetPasswordController.js

// const clearResetAttempts = async (userId) => {
//   await User.findByIdAndUpdate(userId, { passwordResetAttempts: 0 });
// };

export const resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { password, confirmPassword } = req.body;

  logger.info(`Password reset attempt for token: ${resetToken}`);

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
      message:
        " Please address the following requirements: " +
        unmetRequirements.join(" "),
      requirements: unmetRequirements,
    });
  }

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    logger.warn(`Invalid or expired reset token used: ${resetToken}`);
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token." });
  }

  if (user.password) {
    const isSamePassword = await bcrypt.compare(password, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: "New password must differ from the old password.",
      });
    }
  }

  user.password = await bcrypt.hash(password, await bcrypt.genSalt(12));
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  user.passwordChangedAt = Date.now();
  user.passwordVersion = (user.passwordVersion || 0) + 1;
  user.passwordResetAttempts += 1;

  await user.save();
  // await clearResetAttempts(user._id); // Clear reset attempts after successful reset

  const message = `
    <h1>Your Password Has Been Successfully Reset</h1>
    <p>Dear ${user.name || "User"},</p>
    <p>Your password was successfully changed on ${new Date().toLocaleString()}.</p>
    <p>If you did not request this change, please take action to secure your account immediately.</p>
    <h3>Security Tips:</h3>
    <ul>
      <li>Use a strong password that is at least 6 to 8 characters long.</li>
      <li>Avoid using common words or easily guessable information.</li>
    </ul>
    <p>If you have any questions or need further assistance, feel free to reach out to our support team.</p>
    <p>Thank you for using our service!</p>
    <p>Best Regards</p>
       <p><strong>ApnaKhata Team</strong></p>

  `;

  try {
    await sendEmail({
      email: user.email,
      subject: "Password Reset Confirmation",
      html: message, // Use 'html' instead of 'message'
    });
    logger.info(`Confirmation email sent to ${user.email}`);
  } catch (error) {
    logger.error(
      `Failed to send confirmation email to ${user.email}: ${error.message}`
    );
  }

  logger.info(`Password reset successful for user: ${user._id}`);
  res.status(200).json({
    success: true,
    message: "Your password has been reset successfully.",
  });
};

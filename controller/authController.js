import User from "../model/userSchema.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import crypto from "crypto";
import { sendEmail } from "../utils/sendEmail.js";
import Expense from "../model/expenseSchema.js";

dotenv.config();

export const validatePassword = (password) => {
  const requirements = [];
  
  if (!/[A-Z]/.test(password)) { 
    requirements.push("Password must contain at least one uppercase letter.");
  }
  if (!/[a-z]/.test(password)) {
    requirements.push("Password must contain at least one lowercase letter.");
  }
  if (!/[0-9]/.test(password)) {
    requirements.push("Password must contain at least one number.");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    requirements.push("Password must contain at least one special character.");
  }
  

  return requirements;
};

export const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

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
          "Missing requirements: " +
          unmetRequirements.join(" "),
        requirements: unmetRequirements,
      });
    }

    const existingUserByEmail = await User.findOne({ email });
    if (existingUserByEmail) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    if (name) {
      const existingUserByUsername = await User.findOne({ name });
      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username is already in use." });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res
      .status(500)
      .json({ message: "Error registering user", error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(404).json({ message: "Email is not registered" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(403).json({ message: "Invalid password" });
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "30d",
    });

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

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const expenses = await Expense.find({ "paidBy.userId": userId });

    res.status(200).json({ user, expenses });
  } catch (error) {
    console.error("Error fetching profile with expenses:", error);
    res
      .status(500)
      .json({ message: "Error fetching profile", error: error.message });
  }
};

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

export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res
        .status(400)
        .json({ message: "Please provide a valid email address" });
    }

    const user = await User.findOne({ email }).select("+passwordResetAttempts");

    if (!user) {
      return res.status(200).json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    user.sendEmailsOnForgetPass = (user.passwordResetAttempts || 0) + 1;

    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

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

    await sendEmail({
      email: user.email,
      subject: "Password Reset Request",
      html: message,
    });
    console.log(`Forgot Email sent to ${user.email}`);
    res.status(200).json({
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in forgotPassword:", error);

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
};


// resetPassword controller
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
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select('+password');

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired token." });
    }

    // Compare the new password with the old one
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
    user.passwordChangedAt = new Date();
    user.passwordVersion = (user.passwordVersion || 0) + 1;
    user.passwordResetAttempts = (user.passwordResetAttempts || 0) + 1;

    await user.save();

    const formatDate = (date) => {
      return new Intl.DateTimeFormat('en-GB', {
        weekday: 'long',
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
        timeZone: "Asia/Karachi",
        timeZoneName: "short"
      }).format(date);
    };

    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    const message = `
      <h1>Your Password Has Been Successfully Reset</h1>
      <p>Dear ${user.name || "User"},</p>
      <p>Your password was successfully changed on ${formattedDate}.</p>
      <p>If you did not request this change, please take action to secure your account immediately.</p>
      <h3>Security Tips:</h3>
      <ul>
        <li>Use a strong password that is at least 6 to 8 characters long.</li>
        <li>Avoid using common words or easily guessable information.</li>
      </ul>
      <p>If you have any questions or need further assistance, feel free to reach out to our support team.</p>
      <p>Thank you for using our service!</p>
      <p>Best Regards,</p>
      <p><strong>ApnaKhata Team</strong></p>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Confirmation",
        html: message,
      });
      console.log(`Reset Email sent to ${user.email}`);
    } catch (error) {
      console.error(
        `Failed to send confirmation email to ${user.email}: ${error.message}`
      );
      // Note: We're not returning here, as the password reset was successful even if the email failed
    }

    res.status(200).json({
      success: true,
      message: "Your password has been reset successfully.",
    });
  } catch (error) {
    console.error("Password reset error:", error);
    res.status(500).json({ 
      success: false, 
      message: "An error occurred while resetting the password." 
    });
  }
};

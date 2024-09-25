// backend/models/User.js

import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
      select: false, // Ensures password isn't returned by default
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple documents without this field
    },
    isGoogleUser: {
      type: Boolean,
      default: false,
    },
    profile: {
      picture: {
        type: String,
      },
      locale: {
        type: String,
      },
    },

    lastLogin: {
      type: Date,
    },
    
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    passwordResetAttempts: {
      type: Number,
      default: 0,
    },
    sendEmailsOnForgetPass: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: Date,
    passwordVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to hash password if modified and not a Google user
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isGoogleUser) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// Method to compare entered password with the hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

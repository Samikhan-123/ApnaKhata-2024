import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [15, 'Name cannot be more than 15 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      trim: true,
      lowercase: true,
      unique: true,
    },
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
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
    // sendEmailsOnForgetPass: {
    //   type: Number,
    //   default: 0,
    // },
    passwordChangedAt: Date,
    passwordVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Method to compare entered password with the hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

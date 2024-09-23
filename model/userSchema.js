import mongoose from 'mongoose';
// import crypto from 'crypto';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    // required: [true, 'Please provide a name'],
    trim: true,
    // maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    trim: true,
    lowercase: true,
    // match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    // minlength: [6, 'Password must be at least 6 characters long'],
    select: false // This ensures that the password is not returned by default
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true // Allows multiple documents without this field
  },
  isGoogleUser: {
    type: Boolean,
    default: false
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
    type: Date
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

}, { timestamps: true });

// Method to compare entered password with the hashed password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to generate a password reset token
// userSchema.methods.getResetPasswordToken = function() {
//   const resetToken = crypto.randomBytes(20).toString('hex');

//   this.resetPasswordToken = crypto
//     .createHash('sha256')
//     .update(resetToken)
//     .digest('hex');

//   this.resetPasswordExpire = Date.now() + 5 * 60 * 1000; // 10 minutes

//   return resetToken;
// };

const User = mongoose.model('User', userSchema);

export default User;

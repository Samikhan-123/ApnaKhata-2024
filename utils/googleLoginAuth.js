import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../model/userSchema.js';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { tokenId } = req.body;

    if (!tokenId) {
      return res.status(400).json({ message: 'Token ID is required.' });
    }

    // Verify the token
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture, locale } = payload;

    // Check if user already exists based on googleId
    let user = await User.findOne({ googleId });

    // If the user does not exist, create a new user
    if (!user) {
      user = new User({
        name,
        email,
        isGoogleUser: true,
        googleId, // Store the Google ID in the user model
        profile: {
          picture,
          locale,
        },
      });

      await user.save();
    }

    // Generate JWT token with user ID and other claims
    const token = jwt.sign(
      { _id: user._id, iat: Math.floor(Date.now() / 1000) },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Attach the user object to the response
    res.status(200).json({
      success: true,
      message: 'Google login successful.',
      user: {
        _id: user._id, // User ID from the database
        name: user.name,
        email: user.email,
        isGoogleUser: user.isGoogleUser,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({ message: 'Error logging in with Google.', error: error.message });
  }
};

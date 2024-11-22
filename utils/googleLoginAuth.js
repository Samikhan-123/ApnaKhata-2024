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
      return res
        .status(400)
        .json({ success: false, message: 'Token ID is required.' });
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

    // If the user does not exist, check by email
    if (!user) {
      // Check if there's an existing local user with the same email
      user = await User.findOne({ 'local.email': email });
      if (user) {
        // If found and it's not a Google user
        if (!user.isGoogleUser) {
          return res.status(400).json({
            success: false,
            message:
              'This account is registered as a local user. Please log in using your email and password.',
          });
        }
      } else {
        // If no user exists, create a new one
        user = new User({
          name,
          email,
          isGoogleUser: true,
          googleId,
          profile: {
            picture,
            locale,
          },
        });

        await user.save();
      }
    }

    // Generate JWT token with user ID and other claims
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Attach the user object to the response
    res.status(200).json({
      success: true,
      message: 'Google login successful.',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isGoogleUser: user.isGoogleUser,
        profile: user.profile,
      },
      token,
    });
  } catch (error) {
    console.error('Google login error:', error);

    // Handle duplicate key error specifically
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message:
          'A user with this email already exists. Please log in using your email and password.',
      });
    }

    res
      .status(500)
      .json({
        success: false,
        message: 'ohh! something went wrong with server.',
        error: error.message,
      });
  }
};

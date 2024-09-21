import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from '../model/userSchema.js';

dotenv.config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const GoogleAuthHandler = async (req, res) => {
    const { idToken } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { email, name, sub: googleId } = ticket.getPayload();

        let user = await User.findOne({ email });

        if (!user) {
            user = new User({
                email,
                name,
                googleId,
                isGoogleUser: true,
                profile,
            });
            await user.save();
        }

        const token = jwt.sign(
            { id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRY || '30d' }
        ); 

        res.json({ success: true, user: { id: user._id, name: user.name, email: user.email }, token });

    } catch (error) {
        console.error("Google authentication error:", error);
        res.status(400).json({ success: false, message: "Authentication failed" });
    }
};
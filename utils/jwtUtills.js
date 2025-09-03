import jwt from 'jsonwebtoken';
import User from '../model/userSchema.js';
// import User from '../model/userSchema.js';

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Split to get the token

    if (!token) {
      return res.status(401).json({ success: false, message: "Authorization is required." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find the user by _id
    const user = await User.findById(decoded._id).select('-password');
    // console.log(decoded._id)

    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    req.user = user; // Attach the user object to the request
    next();
  } catch (error) {
    // console.error("Error in authenticate middleware:", error.message); // Log the error message
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: "Invalid token please login again" });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: "Token expired please login again" });
    }
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};

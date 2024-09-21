import jwt from 'jsonwebtoken'; // Ensure you import jwt correctly
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

export const authenticate = (req, res, next) => {
  try {
    // console.log('Authorization header:', req.headers.authorization); // Debugging
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: "Authorization token is required." });
    }

    const token = authHeader.split(' ')[1];
    // console.log('Token:', token); // Debugging
    const decoded = jwt.verify(token, process.env.JWT_SECRET); 
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Error in requireSignIn middleware:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};


    export const isAdmin = async (req, res, next) => {
        try {
          const userId = req.user._id;
          const user = await userModel.findById(userId);
      
          if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
          }
      
          if (user.role !== "admin") {
            return res.status(403).json({ success: false, message: "Unauthorized access" });
          }
      
          next();
        } catch (error) {
          console.error("Error in isAdmin middleware:", error);
          return res.status(500).json({ success: false, message: "Internal server error" });
        }
      };
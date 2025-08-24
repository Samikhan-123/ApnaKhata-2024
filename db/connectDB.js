import mongoose from 'mongoose';
import colors from 'colors';
import dotenv from 'dotenv';

// mongoose.set('strictQuery', false);

dotenv.config();

const connectDB = async () => { 
  try {
    // console.log(
    //   colors.bgMagenta.cyan('MONGO_URI:'),
    //   colors.grey(process.env.MONGODB_URI)
    // ); 
    const connectMe = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000, // Timeout after 30s
      socketTimeoutMS: 35000, // Close sockets after 35s
      family: 4,
    });

    console.log(
      `Connected to MongoDB Database: ${connectMe.connection.host}`.bgMagenta 
        .white 
    );
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.bgRed.white);
    res.status(500).json({
      success: false,
      message: "Database connection failed",
      error: process.env.NODE_ENV === 'development' ? error : undefined,
    });
    // process.exit(1); // Exit the process with failure
  }
};

export default connectDB;

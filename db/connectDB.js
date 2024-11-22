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
      serverSelectionTimeoutMS: 5000, // Wait for 5 seconds before timing out
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity 
    });

    console.log(
      `Connected to MongoDB Database: ${connectMe.connection.host}`.bgMagenta 
        .white 
    );
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.bgRed.white);
    process.exit(1); // Exit the process with failure 
  }
};

export default connectDB;

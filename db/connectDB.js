import mongoose from "mongoose";
import colors from "colors";

mongoose.set('strictQuery', false);

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,  // Wait for 5 seconds before timing out
      socketTimeoutMS: 45000,  // Close sockets after 45 seconds of inactivity
    });

    console.log(
      `Connected to MongoDB Database: ${conn.connection.host}`.bgMagenta.white
    );
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.bgRed.white);
    process.exit(1);  // Exit the process with failure
  }
};

export default connectDB;

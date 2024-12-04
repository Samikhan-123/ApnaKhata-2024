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
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Timeout after 30s
      socketTimeoutMS: 45000, // Close sockets after 45s
      family: 4,
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

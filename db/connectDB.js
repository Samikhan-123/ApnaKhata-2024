import mongoose from "mongoose";
import colors from "colors";
import dotenv from "dotenv";
import { GridFSBucket } from "mongodb";

dotenv.config();

let gfs;
let gridFSBucket;

const connectDB = async () => {
  try {
    const connectMe = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 35000,
      family: 4,
    });

    // Initialize GridFS
    const conn = mongoose.connection;
    gridFSBucket = new GridFSBucket(conn.db, {
      bucketName: "receipts",
    });

    console.log(
      `Connected to MongoDB Database: ${connectMe.connection.host}`.bgMagenta
        .white
    );
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`.bgRed.white);
    // process.exit(1);
  }
};

export { gridFSBucket };
export default connectDB;

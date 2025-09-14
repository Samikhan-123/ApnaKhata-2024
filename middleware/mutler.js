import multer from "multer";
import { GridFSBucket } from "mongodb";
import mongoose from "mongoose";
import { gridFSBucket } from "../db/connectDB.js";

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter function
const fileFilter = (req, file, cb) => {
  const allowedFileTypes = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "application/pdf": "pdf",
  };

  if (allowedFileTypes[file.mimetype]) {
    cb(null, true);
  } else {
    console.log("Invalid file type");
    return res.status(400).json({
      success: false,
      message:
        "Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed",
    });
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 1 * 1024 * 1024, // 1MB file size limit
  },
});

// Function to upload file to GridFS
export const uploadToGridFS = (file) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      return resolve(null);
    }

    const filename = `receipt-${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const uploadStream = gridFSBucket.openUploadStream(filename, {
      contentType: file.mimetype,
      metadata: {
        originalName: file.originalname,
        uploadedAt: new Date(),
      },
    });

    uploadStream.end(file.buffer);

    uploadStream.on("error", (error) => {
      reject(error);
    });

    uploadStream.on("finish", () => {
      resolve({
        filename: filename,
        fileId: uploadStream.id,
        contentType: file.mimetype,
        originalName: file.originalname,
      });
    });
  });
};

// Function to delete file from GridFS
export const deleteFromGridFS = async (fileId) => {
  try {
    if (!fileId) return;

    // Convert string ID to ObjectId if needed
    const objectId =
      typeof fileId === "string" ? new mongoose.Types.ObjectId(fileId) : fileId;

    await gridFSBucket.delete(objectId);
  } catch (error) {
    console.error("Error deleting file from GridFS:", error);
    throw error;
  }
};

// Function to get file from GridFS
export const getFileFromGridFS = (fileId) => {
  // Convert string ID to ObjectId if needed
  const objectId =
    typeof fileId === "string" ? new mongoose.Types.ObjectId(fileId) : fileId;

  return gridFSBucket.openDownloadStream(objectId);
};

// Function to get file info from GridFS
export const getFileInfoFromGridFS = async (fileId) => {
  try {
    // Convert string ID to ObjectId if needed
    const objectId =
      typeof fileId === "string" ? new mongoose.Types.ObjectId(fileId) : fileId;

    const files = await gridFSBucket.find({ _id: objectId }).toArray();
    return files[0] || null;
  } catch (error) {
    console.error("Error getting file info from GridFS:", error);
    throw error;
  }
};

// Error handling middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size cannot exceed 1MB",
      });
    }
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  next();
};

// Helper function to get file URL
export const getFileUrl = (req, fileId) => {
  if (!fileId) return null;
  return `${req.protocol}://${req.get("host")}/api/expenses/receipt/${fileId}`;
};

// Middleware to handle file uploads with error handling
export const uploadMiddleware = (fieldName) => {
  return [
    (req, res, next) => {
      upload.single(fieldName)(req, res, (err) => {
        if (err) {
          return handleUploadError(err, req, res, next);
        }
        next();
      });
    },
  ];
};


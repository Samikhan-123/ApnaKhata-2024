import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads/receipts';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create unique filename with timestamp and original extension
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedFileTypes = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'application/pdf': 'pdf',
  };

  // Check if the file type is allowed
  if (allowedFileTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Invalid file type. Only JPEG, PNG, GIF, and PDF files are allowed'
      ),
      false
    );
  }
};

// Configure multer
export const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB file size limit
  },
});

// Error handling middleware
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size cannot exceed 5MB',
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

// Helper function to delete file
export const deleteFile = async (filepath) => {
  try {
    if (filepath && fs.existsSync(filepath)) {
      await fs.promises.unlink(filepath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};

// Helper function to get file URL
export const getFileUrl = (req, filename) => {
  if (!filename) return null;
  return `${req.protocol}://${req.get('host')}/${uploadDir}/${filename}`;
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

// Middleware to clean up old files when updating
export const cleanupOldFile = async (req, res, next) => {
  try {
    if (req.file && req.oldFilePath) {
      await deleteFile(req.oldFilePath);
    }
    next();
  } catch (error) {
    next(error);
  }
};

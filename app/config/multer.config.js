const multer = require('multer');

// Define multer storage, no need for destination since we won't save locally
const storage = multer.memoryStorage(); // Use memory storage for multer

// File filter to allow only images (optional: you can enable it if you want to restrict to image files)
const fileFilter = (req, file, cb) => {
  // Uncomment below line if you want to restrict the file to only images
  // if (!file.mimetype.startsWith('image/')) {
  //   return cb(new Error('Only image files are allowed!'), false);
  // }
  cb(null, true);
};

// Set up the upload middleware
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

// Export the upload instance, make sure it's the correct instance to call .single() on
module.exports = upload;

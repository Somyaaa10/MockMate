const multer = require("multer");

// Image-only upload middleware (for profile photos)
// Accepts JPEG, PNG, WebP — max 5MB
const imageStorage = multer.memoryStorage();

const imageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, PNG, or WebP images are allowed"), false);
  }
};

const imageUpload = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: imageFileFilter,
});

module.exports = imageUpload;

const multer = require("multer");

const storage = multer.memoryStorage();

const uploadRecording = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Only video recordings are allowed"));
    }
  },
});

module.exports = uploadRecording;

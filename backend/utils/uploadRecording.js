const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadRecording = (buffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "mockmate/recordings",
        resource_type: "video",
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = uploadRecording;

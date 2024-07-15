import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

const storage = multer.memoryStorage();
const multerUpload = multer({ storage });

// Cloudinary configuration
cloudinary.config({
  cloud_name: "dq4kbmkrf",
  api_key: "268696593414899",
  api_secret: process.env.CLOUDINARY_API_SECRET, // Click 'View Credentials' below to copy your API secret
});

const uploadToCloudinary = (file, path, userId) => {
  return new Promise((resolve, reject) => {
    const dataUrl = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;
    const publicId = `${userId}_${file.originalname.split(".")[0]}`;

    cloudinary.uploader.upload(
      dataUrl,
      {
        public_id: publicId,
        resource_type: "auto",
        folder: `WorkManagement/${path}`,
        overwrite: true, // Overwrite if the file already exists in the Cloudinary folder
      },
      (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      }
    );
  });
};

export { uploadToCloudinary, multerUpload };

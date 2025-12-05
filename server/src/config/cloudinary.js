import dotenv from "dotenv";
dotenv.config();

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { v2 as cloudinary } from "cloudinary";

// 🔐 Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Allowed file types
const allowedMimeTypes = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
];

// 🌥️ Cloudinary storage (simple + clean)
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "NodeBoilerPlate",
    resource_type: "auto",
    format: async (req, file) => file.mimetype.split("/")[1], // auto detect
    public_id: (req, file) => `${Date.now()}-${file.originalname}`,
  },
});

// 📦 Multer middleware with MIME validation
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return cb(new Error("Only images (png,jpg,jpeg,webp) and PDF allowed"), false);
    }
    cb(null, true);
  },
});

export { upload, cloudinary };

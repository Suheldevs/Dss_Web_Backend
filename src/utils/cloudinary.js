import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFiles = async (files = []) => {
  try {
    const results = [];
    for (const file of files) {
      let uploadedUrl = null;
      let uploadedId = null;
      if (process.env.USE_CLOUDINARY === "true") {
        const uploadRes = await cloudinary.uploader.upload(file.path, {
          folder: process.env.CLOUDINARY_UPLOAD_FOLDER,
          resource_type: "auto",
        });
        uploadedUrl = uploadRes.secure_url;
        uploadedId = uploadRes.public_id;
      }
      //  else {
      //   uploadedUrl = `/${file.path.replace(/\\/g, "/")}`;
      // }

      let filePath;
      if (process.env.DELETE_LOCAL_FILE === "true") {
        fs.unlink(file.path, (err) => {
          if (err) console.error("Error deleting file:", err);
        });
      } else {
        filePath = file.path.replace(/\\/g, "/");
      }

      results.push({
        url: filePath || null,
        public_url: uploadedUrl || null,
        public_id : uploadedId || null ,
      });
    }
    return { success: true, files: results };
  } catch (err) {
    console.error("File upload failed:", err);
    return { success: false, error: err.message };
  }
};




export const deleteFile = async (publicId) => {
  if (!publicId) return null;
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Cloudinary file deleted:", publicId, result);
    return null;
  } catch (err) {
    console.error("Error deleting file from Cloudinary:", err.message);
    return null;
  }
};



export const deleteLocalFile = (filePath) => {
  try {
    const absolutePath = path.resolve(filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
      console.log("Deleted local file:", absolutePath);
    }
  } catch (err) {
    console.error("Error deleting local file:", err);
  }
};

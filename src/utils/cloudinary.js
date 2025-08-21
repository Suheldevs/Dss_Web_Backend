// import { v2 as cloudinary } from "cloudinary";
// import { response } from "express";
// import fs from 'fs'


// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });

// const uploadOnCloudinary = async (filePath) => {
//     try {
//         if (!filePath) return null
//         const res = await cloudinary.uploader.upload(filePath, {
//             resource_type: 'auto'
//         })
//         console.log("File is uploaded on cloudinary ", res.url)
//         return response;
//     }
//     catch (error) {
//         fs.unlinkSync(filePath)
//         return null
//     }
// }

// export {uploadOnCloudinary}



import fs from "fs";
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
    const result = [];
    for (const file of files) {
      let uploadedUrl = null;
      if (process.env.USE_CLOUDINARY === "true") {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: process.env.CLOUDINARY_UPLOAD_FOLDER,
          resource_type: "auto",
        });
        console.log(result)
        uploadedUrl = result.secure_url;
      } else {
        uploadedUrl = `/${file.path.replace(/\\/g, "/")}`; 
      }
 
      let filePath ;
      if (process.env.DELETE_LOCAL_FILE === "true") {
          fs.unlink(file.path, (err) => {
              if (err) console.error("Error deleting file:", err);
            });
        }
        else{
          filePath = file.path.replace(/\\/g, "/");
      }

      result.push({
        url: filePath || null ,
        public_url: uploadedUrl,
      });
    }

    return { success: true, files: result };
  } catch (err) {
    console.error("File upload failed:", err);
    return { success: false, error: err.message };
  }
};

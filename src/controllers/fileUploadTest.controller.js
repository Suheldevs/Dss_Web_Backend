import { uploadFiles } from "../utils/cloudinary.js";


// Single file
export const uploadSingle = async (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }

  const result = await uploadFiles([req.file]);
  if (!result.success) return res.status(500).json(result);

  res.status(200).json({
    success: true,
    message: "File uploaded successfully",
    file: result.files[0],
  });
};

// Multiple files
export const uploadMultiple = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: "No files uploaded" });
  }

  const result = await uploadFiles(req.files);
  if (!result.success) return res.status(500).json(result);

  res.status(200).json({
    success: true,
    message: "Files uploaded successfully",
    files: result.files,
  });
};

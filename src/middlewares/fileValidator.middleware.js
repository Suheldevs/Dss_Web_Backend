import {ApiError} from '../utils/ApiError.js'

const MIME_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  pdf: ["application/pdf"],
  video: ["video/mp4", "video/quicktime", "video/x-msvideo"],
  audio: ["audio/mpeg", "audio/wav"],
};

export const fileValidator = ({ types = ["image"], maxSizeMB = 5 }) => {
  return (req, res, next) => {
    const files = req.files || (req.file ? [req.file] : []);
    if (!files.length) return next(); 

    const allowedTypes = [].concat(...types.map(type => MIME_TYPES[type] || []));
    if (!allowedTypes.length) return next(new ApiError(400, "Invalid validation type(s)"));

    for (const file of files) {
      if (!allowedTypes.includes(file.mimetype)) {
        return res.api(400, `Invalid file type: ${file.originalname}. Allowed types: ${types.join(", ")}`);
      }

      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return res.api(400, `File ${file.originalname} exceeds ${maxSizeMB} MB limit.`);
      }
    }
    next();
  };
};

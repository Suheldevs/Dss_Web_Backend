// import multer from 'multer'

// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/temp')
//   },
//   filename: function (req, file, cb) { 
//     cb(null, file.originalname)
//   }
// })

// export const upload = multer({ storage})


import multer from "multer";
import fs from "fs";
import path from "path";

 const Upload = (folderName = "temp") => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = path.join("public", folderName);
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname);
    },
  });
  return multer({ storage });
};
export default Upload;

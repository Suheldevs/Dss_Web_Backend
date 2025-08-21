import express from "express";


import Upload  from "../middlewares/multer.middleware.js";
import { uploadMultiple, uploadSingle } from "../controllers/fileUploadTest.controller.js";
import { fileValidator } from "../middlewares/fileValidator.middleware.js";

const router = express.Router();

router.post(
  "/upload/avatar",
  Upload("avatars").single("file"),
  fileValidator({ types: ["image", "pdf"], maxSizeMB: 5 }),
  uploadSingle
);


router.post(
  "/upload/docs",
  Upload("docs").array("files", 5), 
  uploadMultiple
);

export default router;

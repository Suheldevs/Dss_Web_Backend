import express from "express";
import Upload from "../middlewares/multer.middleware.js";
import { fileValidator } from "../middlewares/fileValidator.middleware.js";
import { requireBody } from "../middlewares/validateBody.middleware.js";
import  Inquiry  from "../models/inquiry.model.js";
import { createInquiry, deleteInquiryById, getAllInquiries } from "../controllers/inquiry.controller.js";
const router = express.Router();


router.post(
  "/",
  Upload("Inquiry").array("sitePhoto", 5),
  fileValidator({ types: ["image","pdf"], maxSizeMB: 1 }),
  requireBody(Inquiry),
  createInquiry
);


router.get("/",getAllInquiries)
router.delete("/:id",deleteInquiryById)

export default router
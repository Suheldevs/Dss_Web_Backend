import express from "express";
import { requireBody } from "../middlewares/validateBody.middleware.js";
import { Blog } from "../models/blog.model.js";
import Upload from "../middlewares/multer.middleware.js";
import { fileValidator } from "../middlewares/fileValidator.middleware.js";
import { createBlog, deleteBlogById, getAllBlog, getBlogById, updateBlog } from "../controllers/blog.controller.js";
const router = express.Router();

// router.post(
//   "/create",
//   Upload("blog").single("image"),
//   fileValidator({ types: ["image"], maxSizeMB: 1 }),
//   requireBody(Blog),
//   createBlog
// );

router.post(
  "/create",
  Upload("blog").single("image"),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Blog),
  createBlog
);

router.get("/get/all", getAllBlog)
router.get("/get/:id", getBlogById)
router.delete("/delete/:id", deleteBlogById)
router.put("/update/:id",Upload("blog").single("image"),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Blog), updateBlog)



export default router

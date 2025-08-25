import express from "express";
import { requireBody } from "../middlewares/validateBody.middleware.js";
import { Blog } from "../models/blog.model.js";
import Upload from "../middlewares/multer.middleware.js";
import { fileValidator } from "../middlewares/fileValidator.middleware.js";
import { createBlog, deleteBlogById, getAllBlog, getBlogById, updateBlog } from "../controllers/blog.controller.js";
const router = express.Router();


router.post(
  "/",
  Upload("blog").single("image"),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Blog),
  createBlog
);

router.get("/", getAllBlog)
router.get("/:id", getBlogById)
router.delete("/:id", deleteBlogById)
router.put("/:id",Upload("blog").single("image"),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Blog), updateBlog)



export default router

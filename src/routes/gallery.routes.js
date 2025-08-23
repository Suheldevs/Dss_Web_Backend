import express from "express";
import { requireBody } from "../middlewares/validateBody.middleware.js";
import Upload from "../middlewares/multer.middleware.js";
import  Gallery  from "../models/gallery.model.js";
import { createBlog } from "../controllers/blog.controller.js";
import { createGallery, deleteGallery, getAllGallery, getGalleryById, updateGallery } from "../controllers/gallery.controller.js";
import { fileValidator } from "../middlewares/fileValidator.middleware.js";
const router = express.Router();


router.post(
  "/",
  Upload("Gallery").single("image"),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Gallery),
  createGallery
);

router.get("/", getAllGallery)
router.get("/:id", getGalleryById)
router.delete("/:id", deleteGallery)
router.put(":id",Upload("Gallery").single("image"),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Gallery), updateGallery)



export default router

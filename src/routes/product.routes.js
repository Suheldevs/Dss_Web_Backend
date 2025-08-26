import express from "express";
import { createProduct, deleteProduct, getAllProducts, getProductById, getProductBySlug, updateProduct } from "../controllers/Product.controller.js";
import Upload from "../middlewares/multer.middleware.js";
import { fileValidator } from "../middlewares/fileValidator.middleware.js";
import Product from "../models/product.model.js";
import { requireBody } from "../middlewares/validateBody.middleware.js";
const router = express.Router();


router.post(
  "/",
  Upload("product").array("images", 5),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Product),
  createProduct
);

router.put(
  "/:id",
  Upload("product").array("images", 5),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Product),
  updateProduct
);
router.get("/:id",getProductById)
router.get("/",getAllProducts)
router.get("/slug/:slug",getProductBySlug)
router.delete("/:id",deleteProduct)

export default router
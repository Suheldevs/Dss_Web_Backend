import express from "express";
import { requireBody } from "../middlewares/validateBody.middleware.js";
import Visiter from "../models/visitor.model.js";
import { createVisitor, deleteVisitorById, getAllVisitors } from "../controllers/visitor.controller.js";
const router = express.Router();


router.post(
  "/",
  requireBody(Visiter),
  createVisitor
);

router.get("/", getAllVisitors)
router.delete("/:id",  deleteVisitorById)


export default router

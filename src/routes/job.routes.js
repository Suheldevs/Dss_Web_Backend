import express from "express";
import { requireBody } from "../middlewares/validateBody.middleware.js";
import Job  from "../models/job.model.js";
import Upload from "../middlewares/multer.middleware.js";
import { fileValidator } from "../middlewares/fileValidator.middleware.js";
import {
  createJob,
  deleteJobById,
  getAllJobs,
  getJobById,
} from "../controllers/job.controller.js";

const router = express.Router();

router.post(
  "/",
  Upload("jobs").single("resume"),
  fileValidator({ types: ["pdf", "doc", "docx", "image"], maxSizeMB: 5 }),
  requireBody(Job),
  createJob
);

router.get("/", getAllJobs);
router.get("/:id", getJobById);
router.delete("/:id", deleteJobById);

export default router;

import express from "express";
import { requireBody } from "../middlewares/validateBody.middleware.js";
import Upload from "../middlewares/multer.middleware.js";
import { fileValidator } from "../middlewares/fileValidator.middleware.js";
import Team from "../models/team.model.js";
import { createTeam, deleteTeamById, getAllTeam, getTeamById, updateTeam } from "../controllers/team.controller.js";
const router = express.Router();

router.post(
  "/",
  Upload("Team").single("image"),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Team),
  createTeam
);

router.get("/", getAllTeam)
router.get("/:id", getTeamById)
router.delete("/:id", deleteTeamById)
router.put("/:id",Upload("Team").single("image"),
  fileValidator({ types: ["image"], maxSizeMB: 1 }),
  requireBody(Team), updateTeam)



export default router

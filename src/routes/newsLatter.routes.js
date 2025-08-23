import express from "express";
import { requireBody } from "../middlewares/validateBody.middleware.js";
import { getAllSubscribers, sendBulkEmail, subscribeEmail } from "../controllers/newsLatter.controller.js";
import Newsletter from "../models/newsletter.model.js";
const router = express.Router();


router.post(
  "/",
  requireBody(Newsletter),
  subscribeEmail
);

router.get("/", getAllSubscribers)
router.post("/send",  sendBulkEmail)


export default router

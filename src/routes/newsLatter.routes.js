import express from "express";
import { requireBody } from "../middlewares/validateBody.middleware.js";
import { deleteSubscriber, getAllSubscribers, sendBulkEmail, subscribeEmail, toggleSubscriberStatus } from "../controllers/newsLatter.controller.js";
import Newsletter from "../models/newsletter.model.js";
const router = express.Router();


router.post(
  "/",
  requireBody(Newsletter),
  subscribeEmail
);

router.get("/", getAllSubscribers)
router.post("/send",  sendBulkEmail)
router.post("/status/:id", toggleSubscriberStatus)
router.delete("/:id", deleteSubscriber)


export default router

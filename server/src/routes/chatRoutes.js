import express from "express";
import {
  startConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} from "../controllers/chatController.js";

import protect from "../middlewares/authMiddlewares.js";

const router = express.Router();

router.get("/", protect, getConversations);
router.get("/unread", protect, getUnreadCount);
router.post("/product/:productId", protect, startConversation);
router.get("/:id/messages", protect, getMessages);
router.post("/:id/messages", protect, sendMessage);

export default router;

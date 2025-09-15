import express from "express";
import { protectRoute } from "../middleware/auth.js";
import {
  deleteMessage,
  getMessages,
  getUsersForSidebar,
  markMessagesAsSeen,
  sendMessage,
} from "../controllers/messageController.js";

const messageRouter = express.Router();

messageRouter.get("/users", protectRoute, getUsersForSidebar);
messageRouter.get("/:id", protectRoute, getMessages);

messageRouter.post("/send/:id", protectRoute, sendMessage);
messageRouter.put("/seen/:id", protectRoute, markMessagesAsSeen);

messageRouter.delete("/:id", protectRoute, deleteMessage);
export default messageRouter;

//Get all users except the logged in user

import cloudinary from "../lib/cloudinary.js";
import Message from "../models/Messages.js";
import User from "../models/user.js";
import { io, userSocketMap } from "../server.js";
import mongoose from "mongoose"; // Make sure to import mongoose

// --------- To get the users for the Sidebar-----------
export const getUsersForSidebar = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("This is the user-id", userId);

    // 1. Get all users except the current one (1st query - unchanged)
    const filteredUsers = await User.find({
      _id: { $ne: userId },
    }).select("-password");

    // 2. Use an aggregation pipeline to count all unseen messages in one go (2nd query)
    const unseenMessagesCounts = await Message.aggregate([
      // Stage 1: Find all messages sent TO ME that are unseen
      {
        $match: {
          receiverId: new mongoose.Types.ObjectId(String(userId)), // Ensure userId is an ObjectId
          seen: false,
        },
      },
      // Stage 2: Group them by the sender and count them
      {
        $group: {
          _id: "$senderId", // Group by the sender's ID
          count: { $sum: 1 }, // Count the number of messages in each group
        },
      },
    ]);

    // 3. Format the aggregation result into the object the frontend expects
    const unseenMessages = {};
    unseenMessagesCounts.forEach((item) => {
      unseenMessages[item._id] = item.count;
    });

    res.json({ success: true, users: filteredUsers, unseenMessages });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

// Get all messages for selected user
export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;

    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: selectedUserId },
        { senderId: selectedUserId, receiverId: myId },
      ],
    });

    await Message.updateMany(
      { senderId: selectedUserId, receiverId: myId },
      { seen: true }
    );

    res.json({ success: true, messages: messages });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

// api to mark message as seen using message id

// CONTROLLER TO MARK MESSAGES AS SEEN
export const markMessagesAsSeen = async (req, res) => {
  try {
    const currentUserId = req.user._id;
    const otherUserId = req.params.id;

    // Find all messages between the two users where the current user is the receiver
    // and update their 'seen' status to true.
    await Message.updateMany(
      { senderId: otherUserId, receiverId: currentUserId, seen: false },
      { $set: { seen: true } }
    );

    res.json({ success: true });
  } catch (error) {
    console.log("Error in markMessagesAsSeen controller: ", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiverId = req.params.id;
    const senderId = req.user._id;
    //console.log(typeof receiverId);
    // console.log(typeof senderId);
    // console.log(senderId);

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = await Message.create({
      senderId,
      receiverId,
      text,
      image: imageUrl || null,
    });

    //Emit the new message to the receiver socket
    const receiverSocketId = userSocketMap[receiverId];
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.json({ success: true, newMessage });
  } catch (error) {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};

// CONTROLLER TO DELETE A SINGLE MESSAGE
export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params; // Get the message ID from the URL
    const userId = req.user._id; // Get the logged-in user's ID from protectRoute

    // 1. Find the message by its ID
    const message = await Message.findById(messageId);

    // 2. Check if the message exists
    if (!message) {
      return res
        .status(404)
        .json({ success: false, message: "Message not found" });
    }

    // 3. SECURITY: Check if the user trying to delete is the original sender
    // Mongoose ObjectIds must be converted to strings for comparison
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({
          success: false,
          message: "Forbidden: You cannot delete this message.",
        });
    }

    // 4. If all checks pass, delete the message
    await Message.findByIdAndDelete(messageId);

    // 5. Send a success response
    res
      .status(200)
      .json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    console.log("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

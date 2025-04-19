import express from "express";
import Message from './message.model.js'

const router = express.Router();

router.get("/api/messages", async (req, res) => {
  const { sender, receiver } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { sender, receiver },
        { sender: receiver, receiver: sender }
      ]  
    }).sort({ timestamp: 1 }); // Show oldest to newest

    res.json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
});

export default router;

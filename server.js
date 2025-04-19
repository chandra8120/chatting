import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import Message from './models/user.model.js'
import User from './message/message.router.js'
import MessageRouter from './message/message.router.js'

dotenv.config();

const app = express();
const server = http.createServer(app);
   
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // frontend URL
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));
app.use(cors());
app.use(express.json({ limit: "30mb" }));
app.use("/", User);  // User router
app.use("/", MessageRouter);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.log("MongoDB connection error ❌", err));

// Socket.io handling
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  // Join user rooms
  socket.on("join", ({ userId }) => {
    socket.join(userId);
    console.log(`User ${userId} joined their room`);
  });
   
  // Handle chat messages
  socket.on("chat-message", async ({ sender, receiver, content }) => {
    try {
      console.log("Sender:", sender, "Receiver:", receiver);

      if (!mongoose.Types.ObjectId.isValid(sender) || !mongoose.Types.ObjectId.isValid(receiver)) {
        const errorMessage = "Invalid ObjectId format";
        console.error(errorMessage);
        socket.emit("error", { message: errorMessage });
        return;
      }
  
      const senderObjectId = new mongoose.Types.ObjectId(sender);
      const receiverObjectId = new mongoose.Types.ObjectId(receiver);

      const message = new Message({ sender: senderObjectId, receiver: receiverObjectId, content });
      await message.save();

      // Send message to receiver if different from sender
      if (sender !== receiver) {
        io.to(receiver).emit("chat-message", { sender, content });
      }

      // Confirmation to sender
      socket.emit("message-sent", { content, status: "success" });
    } catch (err) {
      console.error("Error saving message:", err);
      socket.emit("error", { message: "Error saving message" });
    }
  });

  // --- WebRTC Signaling for Video/Audio Calls ---

  // Offer from caller
  socket.on("offer", (data) => {
    console.log("📞 Offer from", data.from, "to", data.to);
    io.to(data.to).emit("offer", data);
  });

  // Answer from callee
  socket.on("answer", (data) => {
    console.log("📲 Answer from", data.from, "to", data.to);
    io.to(data.to).emit("answer", data);
  });

  // ICE candidate exchange
  socket.on("ice-candidate", (data) => {
    console.log("🧊 ICE candidate from", data.from, "to", data.to);
    io.to(data.to).emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// Start the server
server.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on http://localhost:${process.env.PORT}`);
});

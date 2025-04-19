// structured/messages/message.model.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },  // Assuming the model is "User"
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Same here for "User"
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model("Message", messageSchema);

import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String, // URL to profile picture (optional)
    default: ""
  },
  online: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model("Userr", userSchema);

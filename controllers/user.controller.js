import User from '../models/user.model.js'
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from 'dotenv'

dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET;

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const userExist = await User.findOne({ email });
    if (userExist) return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Update user status to online
    await updateOnlineStatus(user._id);  // Update online status

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "7d" });

    res.status(200).json({
      message: "Login successful",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        online: true,  // Send updated online status
      },
      token,
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

  // User Controller - Mark user as online
export const updateOnlineStatus = async (userId) => {
    try {
      await User.findByIdAndUpdate(userId, { online: true });
    } catch (err) {
      console.error("Error updating online status:", err);
    }
  };

  
  export const getAllUsers = async (req, res) => {
    try {
      const users = await User.find()
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
  };
  // Update user's online status to false (Offline)
export const updateOfflineStatus = async (userId) => {
  try {
    await User.findByIdAndUpdate(userId, { online: false });
  } catch (err) {
    console.error("Error updating offline status:", err);
  }
};

// Logout API endpoint
export const logout = async (req, res) => {
  const { userId } = req.body;

  try {
    // Update the user status to offline
    await updateOfflineStatus(userId);
    
    // Send a response indicating successful logout
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Logout failed", error: err.message });
  }
};
    
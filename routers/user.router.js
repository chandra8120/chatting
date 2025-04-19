import express from "express";
import { register, login,getAllUsers,logout } from '../controllers/user.controller.js'

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/users", getAllUsers);
router.post("/logout", logout);

export default router;

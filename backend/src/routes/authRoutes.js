import { Router } from "express";
import { login, me, register, updateProfile } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";

export const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/me", protect, me);
authRoutes.put("/profile", protect, updateProfile);


import { Router } from "express";
import { dashboard, deleteUser, listUsers, updateUserRole } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middleware/auth.js";

export const adminRoutes = Router();

adminRoutes.use(protect, adminOnly);
adminRoutes.get("/dashboard", dashboard);
adminRoutes.get("/users", listUsers);
adminRoutes.patch("/users/:id/role", updateUserRole);
adminRoutes.delete("/users/:id", deleteUser);


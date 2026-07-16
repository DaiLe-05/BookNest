import { Router } from "express";
import { allOrders, createOrder, downloadInvoice, myOrders, updateOrderStatus } from "../controllers/orderController.js";
import { adminOnly, protect } from "../middleware/auth.js";

export const orderRoutes = Router();

orderRoutes.use(protect);
orderRoutes.post("/", createOrder);
orderRoutes.get("/mine", myOrders);
orderRoutes.get("/:id/invoice", downloadInvoice);
orderRoutes.get("/", adminOnly, allOrders);
orderRoutes.patch("/:id/status", adminOnly, updateOrderStatus);


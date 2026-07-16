import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { adminRoutes } from "./routes/adminRoutes.js";
import { authRoutes } from "./routes/authRoutes.js";
import { bookRoutes } from "./routes/bookRoutes.js";
import { catalogRoutes } from "./routes/catalogRoutes.js";
import { orderRoutes } from "./routes/orderRoutes.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static(path.resolve(__dirname, "../uploads")));

app.get("/", (_req, res) => res.json({ message: "BookNest API is running" }));
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api", catalogRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => console.log(`BookNest API running at http://localhost:${port}`));


import { Router } from "express";
import { createBook, deleteBook, getBook, getBooks, updateBook } from "../controllers/bookController.js";
import { adminOnly, protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

export const bookRoutes = Router();

bookRoutes.get("/", getBooks);
bookRoutes.get("/:id", getBook);
bookRoutes.post("/", protect, adminOnly, upload.single("cover"), createBook);
bookRoutes.put("/:id", protect, adminOnly, upload.single("cover"), updateBook);
bookRoutes.delete("/:id", protect, adminOnly, deleteBook);


import { Router } from "express";
import { createCatalog, deleteCatalog, listCatalog, updateCatalog } from "../controllers/catalogController.js";
import { adminOnly, protect } from "../middleware/auth.js";

export const catalogRoutes = Router();

for (const type of ["categories", "authors", "publishers"]) {
  catalogRoutes.get(`/${type}`, listCatalog(type));
  catalogRoutes.post(`/${type}`, protect, adminOnly, createCatalog(type));
  catalogRoutes.put(`/${type}/:id`, protect, adminOnly, updateCatalog(type));
  catalogRoutes.delete(`/${type}/:id`, protect, adminOnly, deleteCatalog(type));
}


import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const map = {
  categories: prisma.category,
  authors: prisma.author,
  publishers: prisma.publisher
};

const bodySchema = z.object({ name: z.string().min(2), bio: z.string().optional().nullable() });

export const listCatalog = (type) =>
  asyncHandler(async (_req, res) => {
    const items = await map[type].findMany({ orderBy: { name: "asc" } });
    res.json(items);
  });

export const createCatalog = (type) =>
  asyncHandler(async (req, res) => {
    const data = bodySchema.parse(req.body);
    const payload = type === "authors" ? data : { name: data.name };
    const item = await map[type].create({ data: payload });
    res.status(201).json(item);
  });

export const updateCatalog = (type) =>
  asyncHandler(async (req, res) => {
    const data = bodySchema.partial().parse(req.body);
    const payload = type === "authors" ? data : { name: data.name };
    const item = await map[type].update({ where: { id: Number(req.params.id) }, data: payload });
    res.json(item);
  });

export const deleteCatalog = (type) =>
  asyncHandler(async (req, res) => {
    await map[type].delete({ where: { id: Number(req.params.id) } });
    res.json({ message: "Da xoa" });
  });


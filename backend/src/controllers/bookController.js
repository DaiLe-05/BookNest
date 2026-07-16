import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { slugify } from "../utils/slugify.js";

const include = { category: true, author: true, publisher: true };

const bookBody = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  price: z.coerce.number().positive(),
  stock: z.coerce.number().int().min(0),
  pages: z.coerce.number().int().positive().optional().nullable(),
  publishedAt: z.string().optional().nullable(),
  categoryId: z.coerce.number().int(),
  authorId: z.coerce.number().int(),
  publisherId: z.coerce.number().int()
});

export const getBooks = asyncHandler(async (req, res) => {
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 8, 1), 50);
  const search = req.query.search?.toString().trim();
  const sort = req.query.sort?.toString() || "newest";
  const orderBy =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
        ? { price: "desc" }
        : sort === "title_asc"
          ? { title: "asc" }
          : { createdAt: "desc" };
  const where = {
    AND: [
      search
        ? {
            OR: [
              { title: { contains: search } },
              { author: { name: { contains: search } } }
            ]
          }
        : {},
      req.query.categoryId ? { categoryId: Number(req.query.categoryId) } : {},
      req.query.authorId ? { authorId: Number(req.query.authorId) } : {},
      req.query.publisherId ? { publisherId: Number(req.query.publisherId) } : {},
      req.query.minPrice ? { price: { gte: new Prisma.Decimal(req.query.minPrice) } } : {},
      req.query.maxPrice ? { price: { lte: new Prisma.Decimal(req.query.maxPrice) } } : {}
    ]
  };

  const [items, total] = await Promise.all([
    prisma.book.findMany({ where, include, orderBy, skip: (page - 1) * limit, take: limit }),
    prisma.book.count({ where })
  ]);

  res.json({ items, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
});

export const getBook = asyncHandler(async (req, res) => {
  const book = await prisma.book.findUnique({ where: { id: Number(req.params.id) }, include });
  if (!book) return res.status(404).json({ message: "Khong tim thay sach" });
  res.json(book);
});

export const createBook = asyncHandler(async (req, res) => {
  const data = bookBody.parse(req.body);
  const book = await prisma.book.create({
    data: {
      ...data,
      price: new Prisma.Decimal(data.price),
      slug: `${slugify(data.title)}-${Date.now()}`,
      coverImage: req.file ? `/uploads/${req.file.filename}` : req.body.coverImage,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null
    },
    include
  });
  res.status(201).json(book);
});

export const updateBook = asyncHandler(async (req, res) => {
  const data = bookBody.partial().parse(req.body);
  const book = await prisma.book.update({
    where: { id: Number(req.params.id) },
    data: {
      ...data,
      ...(data.title ? { slug: `${slugify(data.title)}-${Date.now()}` } : {}),
      ...(data.price ? { price: new Prisma.Decimal(data.price) } : {}),
      ...(req.file ? { coverImage: `/uploads/${req.file.filename}` } : {}),
      ...(data.publishedAt ? { publishedAt: new Date(data.publishedAt) } : {})
    },
    include
  });
  res.json(book);
});

export const deleteBook = asyncHandler(async (req, res) => {
  await prisma.book.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Da xoa sach" });
});

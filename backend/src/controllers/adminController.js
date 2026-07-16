import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const dashboard = asyncHandler(async (_req, res) => {
  const [revenue, orders, users, books, bestSellers] = await Promise.all([
    prisma.order.aggregate({ where: { status: { not: "CANCELLED" } }, _sum: { total: true } }),
    prisma.order.count(),
    prisma.user.count(),
    prisma.book.count(),
    prisma.orderItem.groupBy({ by: ["bookId"], _sum: { quantity: true }, orderBy: { _sum: { quantity: "desc" } }, take: 5 })
  ]);

  const sellerBooks = await prisma.book.findMany({ where: { id: { in: bestSellers.map((item) => item.bookId) } } });
  res.json({
    revenue: Number(revenue._sum.total || 0),
    orders,
    users,
    books,
    bestSellers: bestSellers.map((item) => ({
      book: sellerBooks.find((book) => book.id === item.bookId),
      sold: item._sum.quantity || 0
    }))
  });
});

export const listUsers = asyncHandler(async (_req, res) => {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, phone: true, address: true, role: true, createdAt: true }
  });
  res.json(users);
});

export const updateUserRole = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: "Khong the tu doi quyen cua chinh minh" });
  const user = await prisma.user.update({
    where: { id: Number(req.params.id) },
    data: { role: req.body.role === "ADMIN" ? "ADMIN" : "USER" },
    select: { id: true, name: true, email: true, role: true }
  });
  res.json(user);
});

export const deleteUser = asyncHandler(async (req, res) => {
  if (Number(req.params.id) === req.user.id) return res.status(400).json({ message: "Khong the xoa chinh minh" });
  await prisma.user.delete({ where: { id: Number(req.params.id) } });
  res.json({ message: "Da xoa nguoi dung" });
});


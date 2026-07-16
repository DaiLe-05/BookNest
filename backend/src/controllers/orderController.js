import PDFDocument from "pdfkit";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const orderInclude = { user: { select: { id: true, name: true, email: true } }, items: { include: { book: true } } };

export const createOrder = asyncHandler(async (req, res) => {
  const data = z
    .object({
      receiverName: z.string().trim().min(1, "Vui lòng nhập tên người nhận"),
      receiverPhone: z.string().trim().min(8, "Vui lòng nhập số điện thoại hợp lệ"),
      shippingAddress: z.string().trim().min(1, "Vui lòng nhập địa chỉ nhận hàng"),
      note: z.string().optional(),
      items: z.array(z.object({ bookId: z.coerce.number().int(), quantity: z.coerce.number().int().positive() })).min(1)
    })
    .parse(req.body);

  const order = await prisma.$transaction(async (tx) => {
    const ids = data.items.map((item) => item.bookId);
    const books = await tx.book.findMany({ where: { id: { in: ids } } });
    if (books.length !== ids.length) {
      const error = new Error("Giỏ hàng có sách không còn tồn tại. Vui lòng xóa giỏ hàng và thêm sách lại.");
      error.status = 400;
      throw error;
    }

    let total = new Prisma.Decimal(0);
    const orderItems = data.items.map((item) => {
      const book = books.find((entry) => entry.id === item.bookId);
      if (book.stock < item.quantity) {
        const error = new Error(`Sách ${book.title} không đủ tồn kho.`);
        error.status = 400;
        throw error;
      }
      total = total.plus(book.price.mul(item.quantity));
      return { bookId: book.id, quantity: item.quantity, price: book.price };
    });

    for (const item of data.items) {
      await tx.book.update({ where: { id: item.bookId }, data: { stock: { decrement: item.quantity } } });
    }

    return tx.order.create({
      data: {
        userId: req.user.id,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        shippingAddress: data.shippingAddress,
        note: data.note,
        total,
        items: { create: orderItems }
      },
      include: orderInclude
    });
  });

  res.status(201).json(order);
});

export const myOrders = asyncHandler(async (req, res) => {
  const orders = await prisma.order.findMany({ where: { userId: req.user.id }, include: orderInclude, orderBy: { createdAt: "desc" } });
  res.json(orders);
});

export const allOrders = asyncHandler(async (_req, res) => {
  const orders = await prisma.order.findMany({ include: orderInclude, orderBy: { createdAt: "desc" } });
  res.json(orders);
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const status = z.enum(["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"]).parse(req.body.status);
  const order = await prisma.order.update({ where: { id: Number(req.params.id) }, data: { status }, include: orderInclude });
  res.json(order);
});

export const downloadInvoice = asyncHandler(async (req, res) => {
  const where = req.user.role === "ADMIN" ? { id: Number(req.params.id) } : { id: Number(req.params.id), userId: req.user.id };
  const order = await prisma.order.findFirst({ where, include: orderInclude });
  if (!order) return res.status(404).json({ message: "Khong tim thay don hang" });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=invoice-${order.id}.pdf`);

  const doc = new PDFDocument({ margin: 48 });
  doc.pipe(res);
  doc.fontSize(20).text("BOOKNEST INVOICE");
  doc.moveDown();
  doc.fontSize(12).text(`Order: #${order.id}`);
  doc.text(`Customer: ${order.receiverName}`);
  doc.text(`Phone: ${order.receiverPhone}`);
  doc.text(`Address: ${order.shippingAddress}`);
  doc.text(`Status: ${order.status}`);
  doc.moveDown();
  order.items.forEach((item) => {
    doc.text(`${item.book.title} x ${item.quantity} - ${Number(item.price).toLocaleString("vi-VN")} VND`);
  });
  doc.moveDown();
  doc.fontSize(14).text(`Total: ${Number(order.total).toLocaleString("vi-VN")} VND`, { align: "right" });
  doc.end();
});

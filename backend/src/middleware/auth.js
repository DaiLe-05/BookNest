import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

export const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : req.query.token;
    if (!token) return res.status(401).json({ message: "Ban chua dang nhap" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, name: true, email: true, phone: true, address: true, role: true }
    });
    if (!user) return res.status(401).json({ message: "Tai khoan khong ton tai" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Phien dang nhap khong hop le" });
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user?.role !== "ADMIN") return res.status(403).json({ message: "Chi admin moi co quyen thuc hien" });
  next();
};

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { signToken } from "../utils/jwt.js";

const authSelect = { id: true, name: true, email: true, phone: true, address: true, role: true };

export const register = asyncHandler(async (req, res) => {
  const data = z
    .object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), phone: z.string().optional(), address: z.string().optional() })
    .parse(req.body);

  const existed = await prisma.user.findUnique({ where: { email: data.email } });
  if (existed) return res.status(409).json({ message: "Email da duoc su dung" });

  const user = await prisma.user.create({
    data: { ...data, password: await bcrypt.hash(data.password, 10) },
    select: authSelect
  });
  res.status(201).json({ user, token: signToken(user) });
});

export const login = asyncHandler(async (req, res) => {
  const data = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user || !(await bcrypt.compare(data.password, user.password))) {
    return res.status(401).json({ message: "Email hoac mat khau khong dung" });
  }
  const safeUser = { id: user.id, name: user.name, email: user.email, phone: user.phone, address: user.address, role: user.role };
  res.json({ user: safeUser, token: signToken(user) });
});

export const me = asyncHandler(async (req, res) => res.json({ user: req.user }));

export const updateProfile = asyncHandler(async (req, res) => {
  const data = z.object({ name: z.string().min(2), phone: z.string().optional().nullable(), address: z.string().optional().nullable() }).parse(req.body);
  const user = await prisma.user.update({ where: { id: req.user.id }, data, select: authSelect });
  res.json({ user });
});


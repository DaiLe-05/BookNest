export const notFound = (_req, res) => res.status(404).json({ message: "Khong tim thay API" });

export const errorHandler = (err, _req, res, _next) => {
  console.error(err);
  if (err.name === "ZodError") {
    return res.status(400).json({ message: err.errors?.[0]?.message || "Dữ liệu không hợp lệ" });
  }
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Loi may chu" });
};

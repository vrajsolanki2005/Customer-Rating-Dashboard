const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV !== "production";

  if (isDev) {
    console.error(err);
  } else {
    console.error(`[${new Date().toISOString()}] ${err.message}`);
  }

  // Prisma known errors
  if (err.code === "P2002") {
    return res.status(409).json({ success: false, message: "A record with this value already exists." });
  }

  if (err.code === "P2025") {
    return res.status(404).json({ success: false, message: "Record not found." });
  }

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
};

module.exports = errorHandler;

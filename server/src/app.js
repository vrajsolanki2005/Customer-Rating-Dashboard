const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const adminRoutes = require("./routes/admin.routes");
const errorHandler = require("./middleware/error.middleware");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Store Rating API is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.use(errorHandler);

module.exports = app;
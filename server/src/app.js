import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import tryOnRoutes from "./routes/tryOnRoutes.js";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());

app.use("/api/auth", authRoutes);//whenever we hit the /api/auth endpoint, it will be handled by the authRoutes router
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/virtual-tryon", tryOnRoutes);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Unknown API path — return JSON, not Express's HTML error page, so the
// client's error handling can read a message off it.
app.use("/api", (req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Last stop for anything thrown upstream, including multer's file-size and
// file-type rejections.
app.use((err, req, res, next) => {
  console.error(err);

  res.status(err.status || 500).json({
    message: err.message || "Something went wrong",
  });
});

export default app;

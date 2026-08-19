import express from "express";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";

import cors from "cors";
const app = express();

app.use(express.json());
app.use(cors());

app.use("/api/auth", authRoutes);//whenever we hit the /api/auth endpoint, it will be handled by the authRoutes router
app.use("/api/products", productRoutes);


export default app;
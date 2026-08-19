import express from "express";
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct,
    getMyProducts,
} from "../controllers/productController.js";

import protect from "../middlewares/authMiddlewares.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

router.post(
    "/",
    protect,
    upload.single("image"),
    createProduct
);

router.get("/", getProducts);
router.get("/myproducts", protect, getMyProducts);
router.get("/:id", getProductById);
router.put("/:id", protect, updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;
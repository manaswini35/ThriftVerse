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
    upload.array("images", 5),
    createProduct
);

router.get("/", getProducts);

// Must sit above "/:id" or Express reads "myproducts" as an id.
router.get("/myproducts", protect, getMyProducts);

router.get("/:id", getProductById);
router.put("/:id", protect, upload.array("images", 5), updateProduct);
router.delete("/:id", protect, deleteProduct);

export default router;

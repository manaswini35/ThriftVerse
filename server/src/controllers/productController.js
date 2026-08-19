import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export const createProduct = async (req, res) => {
    try {
        const { title, description, price, category } = req.body;

        let imageUrl = "";

        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: "thriftverse",
            });

            imageUrl = result.secure_url;

            fs.unlinkSync(req.file.path);
        }

        const product = await Product.create({
            title,
            description,
            price,
            category,
            image: imageUrl,
            seller: req.user.id,
        });

        res.status(201).json({
            message: "Product created successfully",
            product,
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const getProducts = async (req, res) => {
    try {
        const products = await Product.find().populate(
            "seller",
            "name email"
        );

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id).populate(
            "seller",
            "name email"
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

       
        if (product.seller.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }

        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        res.status(200).json(updatedProduct);

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({
                message: "Product not found",
            });
        }

        // Check ownership
        if (product.seller.toString() !== req.user.id) {
            return res.status(401).json({
                message: "Not authorized",
            });
        }

        await Product.findByIdAndDelete(req.params.id);

        res.status(200).json({
            message: "Product deleted successfully",
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
};
export const getMyProducts = async (req, res) => {
    try {
        const products = await Product.find({
            seller: req.user.id,
        }).populate("seller", "name email");

        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}; 



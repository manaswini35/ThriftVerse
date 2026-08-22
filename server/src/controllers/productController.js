import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  price_asc: { price: 1 },
  price_desc: { price: -1 },
};

const PAGE_SIZE = 12;

// Pushes one temp file to Cloudinary and removes it from disk afterwards.
const uploadOne = async (file) => {
  const result = await cloudinary.uploader.upload(file.path, {
    folder: "thriftverse",
  });

  fs.unlink(file.path, () => {});

  return result.secure_url;
};

export const createProduct = async (req, res) => {
  try {
    const { title, description, price, category, size, condition, brand } =
      req.body;

    // upload.array() gives req.files; keep reading req.file so an older
    // single-image client still works.
    const files = req.files?.length ? req.files : req.file ? [req.file] : [];

    const images = [];

    for (const file of files) {
      images.push(await uploadOne(file));
    }

    const product = await Product.create({
      title,
      description,
      price,
      category,
      size,
      condition,
      brand,
      images,
      image: images[0] || "",
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

// Listings feed. Every filter is optional, and the response is paginated —
// the client reads { products, page, pages, total }.
export const getProducts = async (req, res) => {
  try {
    const {
      search,
      category,
      size,
      condition,
      brand,
      minPrice,
      maxPrice,
      sort,
      status,
    } = req.query;

    const filter = {};

    if (search?.trim()) {
      // Regex rather than $text so partial words ("den" -> "denim") match,
      // which is what a shopper typing into a search box expects.
      const term = new RegExp(search.trim(), "i");
      filter.$or = [{ title: term }, { description: term }, { brand: term }];
    }

    if (category) filter.category = category;
    if (size) filter.size = size;
    if (condition) filter.condition = condition;
    if (brand) filter.brand = new RegExp(`^${brand}$`, "i");
    if (status) filter.status = status;

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Number(req.query.limit) || PAGE_SIZE);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("seller", "name email avatar")
        .sort(SORTS[sort] || SORTS.newest)
        .skip((page - 1) * limit)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.status(200).json({
      products,
      page,
      pages: Math.ceil(total / limit) || 1,
      total,
    });
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
      "name email avatar bio location"
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

    // Only fields the owner is allowed to change — otherwise a crafted body
    // could reassign `seller` and hand the listing to someone else.
    const allowed = [
      "title",
      "description",
      "price",
      "category",
      "size",
      "condition",
      "brand",
      "images",
      "status",
    ];

    const updates = {};

    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }

    // Any new photos arrive as files and replace the existing set.
    if (req.files?.length) {
      const images = [];
      for (const file of req.files) {
        images.push(await uploadOne(file));
      }
      updates.images = images;
    }

    if (updates.images?.length) updates.image = updates.images[0];

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate("seller", "name email avatar");

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
    })
      .populate("seller", "name email avatar")
      .sort({ createdAt: -1 });

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

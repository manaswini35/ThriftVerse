import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    category: {
      type: String,
      required: true,
      enum: [
        "tops",
        "bottoms",
        "dresses",
        "outerwear",
        "footwear",
        "accessories",
        "other",
      ],
      default: "other",
    },

    size: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL", "free size"],
      default: "free size",
    },

    condition: {
      type: String,
      enum: ["like new", "good", "fair"],
      default: "good",
    },

    brand: {
      type: String,
      default: "",
      trim: true,
    },

    // Listings can carry several photos now. `image` below is the original
    // single-photo field, kept so listings made before this change still
    // render — see coverImage() on the client.
    images: {
      type: [String],
      default: [],
    },

    image: {
      type: String,
      default: "",
    },

    // A flat-lay shot of the garment on its own, used as the product input
    // for virtual try-on.
    tryOnImage: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["available", "sold"],
      default: "available",
    },

    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Powers the ?search= query on the listings page.
productSchema.index({ title: "text", description: "text", brand: "text" });

const Product = mongoose.model("Product", productSchema);

export default Product;

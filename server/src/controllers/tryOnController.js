import fs from "fs/promises";

import Product from "../models/Product.js";
import cloudinary from "../config/cloudinary.js";
import {
  generateVirtualTryOn,
  tryOnStatus,
  describeGarment,
  garmentImageFor,
  TryOnError,
} from "../services/virtualTryOn/index.js";

// Privacy: the customer's photo is read off disk, handed to the provider as a
// data URI and deleted. It never reaches Cloudinary, the database or a log
// line. Only the generated result is stored, and only so the browser has
// something to show.
const readAsDataUri = async (file) => {
  const bytes = await fs.readFile(file.path);
  return `data:${file.mimetype};base64,${bytes.toString("base64")}`;
};

const discard = async (file) => {
  if (!file?.path) return;
  await fs.unlink(file.path).catch(() => {});
};

// Results live under their own folder and tag so they can be pruned on a
// schedule (Cloudinary: delete resources by tag "tryon") without touching
// listing photos.
const storeResult = async (url) => {
  try {
    const saved = await cloudinary.uploader.upload(url, {
      folder: "thriftverse/tryons",
      tags: ["tryon"],
    });

    return saved.secure_url;
  } catch {
    // Storage is a convenience, not the feature. If Cloudinary is down the
    // provider's own URL still renders — better than failing the request.
    return url;
  }
};

export const getTryOnStatus = (req, res) => {
  res.json(tryOnStatus());
};

export const createTryOn = async (req, res) => {
  const file = req.file;

  try {
    if (!file) {
      throw new TryOnError("input", "Please choose a photo to try this on.");
    }

    if (!file.mimetype?.startsWith("image/")) {
      throw new TryOnError("input", "That file isn't an image. Use a JPG or PNG.");
    }

    const { productId } = req.body;

    if (!productId) {
      throw new TryOnError("input", "Which product? No listing was specified.");
    }

    const product = await Product.findById(productId).catch(() => null);

    if (!product) {
      // Thrown rather than returned so the temp file still hits the cleanup
      // in `finally` — an early return here used to leave the photo on disk.
      const missing = new TryOnError("input", "That listing no longer exists.");
      missing.status = 404;
      throw missing;
    }

    const garment = describeGarment(product);

    if (!garment.supported) {
      throw new TryOnError("unsupported", garment.reason);
    }

    const productImage = garmentImageFor(product);

    if (!productImage) {
      throw new TryOnError("input", "This listing has no photo to try on.");
    }

    const userImage = await readAsDataUri(file);

    // The temp file has served its purpose — drop it before the slow part.
    await discard(file);

    const { imageUrl, demo } = await generateVirtualTryOn({
      userImage,
      productImage,
      category: garment.slot,
      seed: String(product._id),
    });

    res.json({
      // A prepared demo result is already hosted and identical for every
      // customer, so re-uploading it per request would burn Cloudinary quota
      // for nothing.
      imageUrl: demo ? imageUrl : await storeResult(imageUrl),
      demo,
      product: {
        _id: product._id,
        title: product.title,
        price: product.price,
        category: product.category,
      },
    });
  } catch (error) {
    if (error instanceof TryOnError) {
      // Deliberately logging the kind and message only — never the image.
      console.error(`[try-on] ${error.kind}: ${error.message}`);

      return res.status(error.status).json({
        message: error.message,
        kind: error.kind,
      });
    }

    console.error("[try-on] unexpected:", error.message);

    res.status(500).json({
      message: "Something went wrong creating your try-on.",
      kind: "unknown",
    });
  } finally {
    // Belt and braces: the happy path already discarded it before calling the
    // provider, and discard() is a no-op the second time.
    await discard(file);
  }
};

// Virtual try-on, provider-agnostic.
//
//   Controller  →  generateVirtualTryOn()  →  the configured provider  →  URL
//
// Nothing outside this folder imports a provider directly, so swapping Gemini
// for another vendor is: add providers/<vendor>.js exporting { name,
// isConfigured, generate }, register it below, set TRYON_PROVIDER in .env.
// No controller, route or React component changes.

import * as demo from "./providers/demo.js";
import * as gemini from "./providers/gemini.js";
import { TryOnError } from "./errors.js";
import { describeGarment, garmentImageFor } from "./garment.js";

const PROVIDERS = {
  demo,
  gemini,
};

const DEFAULT_PROVIDER = "demo";

const activeProvider = () => {
  const key = process.env.TRYON_PROVIDER || DEFAULT_PROVIDER;
  return PROVIDERS[key] || null;
};

// Lets the client ask "is this feature actually available?" before putting a
// customer through the work of uploading a photo.
export const tryOnStatus = () => {
  const provider = activeProvider();

  return {
    configured: Boolean(provider?.isConfigured()),
    provider: provider?.name || process.env.TRYON_PROVIDER || DEFAULT_PROVIDER,
    // The browser badges the result when this is set, so a prepared image is
    // never shown as though it were generated from the customer's photo.
    demo: Boolean(provider?.isDemo),
  };
};

/**
 * @param {object}  args
 * @param {string}  args.userImage     the customer's photo — data: URI or URL
 * @param {string}  args.productImage  the garment photo URL
 * @param {string}  [args.category]    slot hint: tops | bottoms | one-pieces | auto
 * @param {string}  [args.seed]        stable per-listing value, so the demo
 *                                     provider returns the same result twice
 * @returns {Promise<{ imageUrl: string, provider: string, demo: boolean }>}
 */
export const generateVirtualTryOn = async ({ userImage, productImage, category, seed }) => {
  const provider = activeProvider();

  if (!provider) {
    throw new TryOnError(
      "config",
      `Unknown try-on provider "${process.env.TRYON_PROVIDER}". Check TRYON_PROVIDER in .env.`
    );
  }

  if (!provider.isConfigured()) {
    throw new TryOnError(
      "config",
      "Virtual try-on isn't switched on yet. It needs an API key on the server."
    );
  }

  if (!userImage) throw new TryOnError("input", "No photo was supplied.");
  if (!productImage) throw new TryOnError("input", "This listing has no usable garment photo.");

  const imageUrl = await provider.generate({
    personImage: userImage,
    garmentImage: productImage,
    slot: category,
    seed,
  });

  return { imageUrl, provider: provider.name, demo: Boolean(provider.isDemo) };
};

export { TryOnError, describeGarment, garmentImageFor };

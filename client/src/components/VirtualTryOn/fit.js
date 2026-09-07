// A small mirror of the server's services/virtualTryOn/garment.js, used only
// to decide what the product page offers and what photo to ask for. The
// server re-checks all of this — this copy exists so a customer never gets
// offered a try-on that is going to be refused a screen later.

const WEARABLE = {
  tops: "upper-body",
  outerwear: "upper-body",
  bottoms: "full-body",
  dresses: "full-body",
  other: "full-body",
};

const REASONS = {
  jewellery: "Try-on works on garments — jewellery isn't supported yet.",
  accessories: "Try-on works on garments — bags aren't supported yet.",
  footwear: "Try-on works on garments — shoes aren't supported yet.",
};

// The photo that actually shows the garment: the seller's flat-lay if there
// is one, else the gallery cover.
export const garmentImageFor = (product) =>
  product?.tryOnImage || product?.images?.[0] || product?.image || "";

export function tryOnFor(product) {
  if (!product) return { supported: false, reason: "" };

  const category = product.category || "other";
  const fitGuide = WEARABLE[category];

  if (!fitGuide) {
    return { supported: false, reason: REASONS[category] || "" };
  }

  const garmentImage = garmentImageFor(product);

  if (!garmentImage) {
    return { supported: false, reason: "This listing has no photo to try on." };
  }

  return { supported: true, fitGuide, garmentImage };
}

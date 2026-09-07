// What the try-on model needs to know about a listing before it can dress
// anyone in it. Keeping this here means the provider adapters stay dumb and
// the rules live in one readable place.
//
// `slot` is the vocabulary most try-on models share (tops / bottoms /
// one-pieces). `photo` is what we ask the customer to upload — a saree needs
// a full-body shot, a knit jumper does not.

const WEARABLE = {
  tops: { slot: "tops", photo: "upper-body" },
  outerwear: { slot: "tops", photo: "upper-body" },
  bottoms: { slot: "bottoms", photo: "full-body" },
  dresses: { slot: "one-pieces", photo: "full-body" },
};

// Categories a garment try-on model cannot do anything sensible with. Saying
// so up front beats letting someone upload a selfie and wait 40 seconds for
// a picture of themselves not wearing a bracelet.
const NOT_WEARABLE = {
  jewellery: "Jewellery can't be tried on virtually yet — the model only fits garments.",
  accessories: "Bags and accessories can't be tried on virtually yet — the model only fits garments.",
  footwear: "Shoes can't be tried on virtually yet — the model only fits garments.",
};

// A saree drapes rather than fits, so it goes through as a one-piece but with
// its own note. Detected from the title because the schema has no sub-type.
const DRAPED = /\b(saree|sari)\b/i;

export const describeGarment = (product) => {
  const category = product.category || "other";

  if (NOT_WEARABLE[category]) {
    return { supported: false, reason: NOT_WEARABLE[category] };
  }

  // "other" is a real schema value and might be a garment, so let it through
  // and let the model decide rather than blocking the customer.
  const rule = WEARABLE[category] || { slot: "auto", photo: "full-body" };

  return {
    supported: true,
    slot: rule.slot,
    photo: rule.photo,
    draped: DRAPED.test(product.title || ""),
    category,
  };
};

// The listing photo that actually shows the garment. `tryOnImage` is the
// flat-lay a seller can attach for exactly this purpose; the gallery cover is
// the fallback, and `image` covers listings made before the schema grew an
// images array.
export const garmentImageFor = (product) =>
  product.tryOnImage || product.images?.[0] || product.image || "";

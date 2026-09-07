// Canned try-on results for the "demo" provider.
//
// WHY THIS EXISTS
// Every hosted try-on model that can be called from a server costs money.
// The free ones (Kolors, IDM-VTON, CatVTON) are free precisely because they
// only accept a human in a browser — they reject API calls. So for a demo
// that has to work reliably, offline, with no key and no bill, we serve
// prepared results instead of generating them.
//
// HOW TO FILL THIS IN
// You can still use those free browser demos BY HAND. Open one, upload a
// photo of yourself plus a listing's garment photo, download the result, and
// put the URL here. Ten minutes of clicking gives you a demo that looks
// exactly like the real thing, because it IS the real thing — just generated
// ahead of time rather than on request.
//
//   1. https://huggingface.co/spaces/Kwai-Kolors/Kolors-Virtual-Try-On
//   2. Upload your photo + the garment photo from one of your listings.
//   3. Download the result, upload it to Cloudinary (or any host).
//   4. Paste the URL below under the matching slot.
//
// Keyed by garment slot, so a dress try-on returns a dress result. Add as
// many per slot as you like — the provider picks one deterministically from
// the product id, so the same listing always shows the same result and your
// demo is repeatable.

export const DEMO_RESULTS = {
  tops: [],
  bottoms: [],
  "one-pieces": [],
};

// True once at least one real result has been added. Until then the provider
// falls back to the listing photo, which is honest but unimpressive — the
// point is that the flow still completes end to end.
export const hasCuratedResults = () =>
  Object.values(DEMO_RESULTS).some((list) => list.length > 0);

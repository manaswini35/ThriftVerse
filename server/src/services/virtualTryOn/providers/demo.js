// Demo try-on provider — no API, no key, no bill, no network.
//
// Serves prepared results from ../../../data/demoTryOns.js instead of
// generating them. Everything else in the pipeline is real: the customer's
// photo is still uploaded, validated, read and discarded exactly as it would
// be for a paid provider, so what you are demonstrating is the actual system
// with one component stubbed — not a mock-up of it.
//
// The result is flagged all the way to the browser, which badges it. A canned
// image must never be passed off as a generation of the customer's photo.

import { DEMO_RESULTS } from "../../../data/demoTryOns.js";

export const name = "demo";

// Nothing to configure — that is the entire point of this provider.
export const isConfigured = () => true;

// Deliberately marks its own output, and index.js propagates the flag. If you
// write a new provider, leave this false or omit it.
export const isDemo = true;

// A real generation takes 10-40s. Returning instantly would make the loading
// state — a real part of the UI worth showing — flash past unseen.
const DELAY_MS = 2600;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Same product, same result, every time. A demo that shuffles its output
// between runs is a demo that looks broken when you show it twice.
const pick = (list, seed) => {
  if (!list.length) return "";

  let hash = 0;

  for (const ch of String(seed)) {
    hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  }

  return list[hash % list.length];
};

export const generate = async ({ garmentImage, slot, seed }) => {
  await sleep(DELAY_MS);

  const curated = pick(DEMO_RESULTS[slot] || [], seed || slot || "demo");

  // Falling back to the listing photo keeps the flow completing end to end
  // before any results have been prepared. It is obviously not a try-on, but
  // the badge says so, and nothing in the chain silently fails.
  return curated || garmentImage;
};

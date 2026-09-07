// Google Gemini virtual try-on adapter.
// Docs: https://ai.google.dev/gemini-api/docs/image-generation
//
// Unlike a dedicated try-on model, Gemini is a general image editor: we hand
// it the customer's photo, the garment photo and an instruction, and it
// returns an edited photograph. One synchronous call — no prediction id and
// no polling loop.
//
// Two consequences worth knowing:
//   * every input image must be inline base64, so a garment URL from
//     Cloudinary is fetched and encoded here rather than passed through;
//   * the result comes back as base64, which we hand upward as a data: URI
//     so the controller can store it exactly like any other image source.
//
// This file is the ONLY place in the codebase that knows Gemini exists. To
// swap providers, write a sibling with the same three exports and register it
// in ../index.js.

import { TryOnError } from "../errors.js";

const BASE = "https://generativelanguage.googleapis.com/v1beta/models";

// gemini-2.5-flash-image is the image-output model. Note the "-image" suffix:
// plain gemini-2.5-flash is text-only and will refuse to return a picture.
// The newer gemini-3.1-flash-image is a drop-in upgrade via TRYON_MODEL.
const MODEL = () => process.env.TRYON_MODEL || "gemini-2.5-flash-image";

// Generation usually lands in 10-30s. The cap sits under the client's 150s
// axios timeout so a stall surfaces as our error, not a dead connection.
const TIMEOUT_MS = 120000;

// Per-slot wording matters more than it looks: without it the model tends to
// restyle the whole outfit when asked for a pair of jeans.
const INSTRUCTION = {
  tops: "Replace ONLY the upper-body garment the person is wearing with the garment shown in the second image. Leave their trousers, skirt, shoes and accessories untouched.",
  bottoms:
    "Replace ONLY the lower-body garment the person is wearing with the garment shown in the second image. Leave their top, shoes and accessories untouched.",
  "one-pieces":
    "Replace the person's outfit with the single one-piece garment shown in the second image, worn as a complete outfit.",
  auto: "Identify which garment in the second image is being sold, and replace the corresponding item of the person's clothing with it.",
};

const buildPrompt = (slot) =>
  [
    "You are the virtual try-on system for an online second-hand clothing marketplace.",
    "",
    "The FIRST image is a photo of a real customer. The SECOND image is a garment from a listing.",
    "",
    INSTRUCTION[slot] || INSTRUCTION.auto,
    "",
    "Requirements:",
    "- Keep the person's face, hair, skin tone, body shape and pose exactly as they are.",
    "- Keep the background exactly as it is.",
    "- Reproduce the garment faithfully: colour, pattern, print, texture, fastenings and length must match the second image.",
    "- Drape the garment naturally on the body, with folds, shadows and lighting consistent with the original photo.",
    "- Do not beautify, slim, retouch or otherwise alter the person.",
    "",
    "Return only the edited photograph.",
  ].join("\n");

// Accepts either a data: URI (the customer's photo, already in memory) or an
// https URL (the listing photo on Cloudinary) and normalises both to the
// inline form the API wants.
const toInlineImage = async (source, label) => {
  const inline = /^data:([^;,]+);base64,(.+)$/s.exec(source);

  if (inline) {
    return { mime_type: inline[1], data: inline[2] };
  }

  let res;

  try {
    res = await fetch(source, { signal: AbortSignal.timeout(20000) });
  } catch {
    throw new TryOnError("upstream", `Couldn't load the ${label}.`);
  }

  if (!res.ok) {
    throw new TryOnError("upstream", `Couldn't load the ${label}.`);
  }

  const mime = (res.headers.get("content-type") || "image/jpeg").split(";")[0];

  if (!mime.startsWith("image/")) {
    throw new TryOnError("input", `The ${label} isn't a usable image.`);
  }

  const bytes = Buffer.from(await res.arrayBuffer());

  return { mime_type: mime, data: bytes.toString("base64") };
};

// The model can decline to edit a photo of a person — usually a safety filter
// rather than a fault in the image. Either way the customer needs a sentence
// they can act on, so dig the reason out of whatever came back.
const explainMissingImage = (data) => {
  if (data.promptFeedback?.blockReason) {
    return "That photo was rejected by the safety filter. Try a clear, fully-clothed photo of yourself.";
  }

  const candidate = data.candidates?.[0];
  const reason = candidate?.finishReason;

  if (reason === "IMAGE_SAFETY" || reason === "SAFETY" || reason === "PROHIBITED_CONTENT") {
    return "The model wouldn't generate a try-on from that photo. Try a clear, fully-clothed photo against a plain background.";
  }

  // A text-only reply means it explained itself instead of editing.
  const said = candidate?.content?.parts?.find((part) => part.text)?.text;

  if (said) return said.trim().slice(0, 200);

  return "The model couldn't produce a try-on from that photo.";
};

export const name = "gemini";

export const isConfigured = () => Boolean(process.env.GEMINI_API_KEY);

export const generate = async ({ personImage, garmentImage, slot }) => {
  const [person, garment] = await Promise.all([
    toInlineImage(personImage, "photo"),
    toInlineImage(garmentImage, "listing photo"),
  ]);

  let res;

  try {
    res = await fetch(`${BASE}/${MODEL()}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Header rather than ?key= so the secret stays out of any URL that
        // might reach a log line or a proxy's access record.
        "x-goog-api-key": process.env.GEMINI_API_KEY,
      },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            // Order is load-bearing — the prompt refers to the "first" and
            // "second" image, so the person must precede the garment.
            parts: [
              { text: buildPrompt(slot) },
              { inline_data: person },
              { inline_data: garment },
            ],
          },
        ],
        generationConfig: {
          // Without this the model is free to answer with prose instead.
          responseModalities: ["IMAGE"],
        },
      }),
    });
  } catch (error) {
    if (error?.name === "TimeoutError") {
      throw new TryOnError("timeout", "Try-on took too long. Please try again.");
    }

    throw new TryOnError("upstream", "Could not reach the try-on service.");
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.error?.message || "Try-on request failed";
    const status = data.error?.status;

    // An invalid key comes back as 400 API_KEY_INVALID, not 401 — so match on
    // the payload as well as the status code, or a server misconfiguration
    // reads to the customer as their photo being the problem.
    if (
      res.status === 401 ||
      res.status === 403 ||
      status === "PERMISSION_DENIED" ||
      /api[_ ]key/i.test(message)
    ) {
      throw new TryOnError("config", "The try-on API key was rejected.");
    }

    if (res.status === 429 || status === "RESOURCE_EXHAUSTED") {
      throw new TryOnError("busy", "The try-on service is busy. Try again in a moment.");
    }

    if (res.status >= 500) {
      throw new TryOnError("upstream", "The try-on service is having trouble. Try again shortly.");
    }

    throw new TryOnError("upstream", message);
  }

  // REST replies in camelCase even though it accepts snake_case going in.
  const parts = data.candidates?.[0]?.content?.parts || [];
  const image = parts.find((part) => part.inlineData?.data || part.inline_data?.data);

  if (!image) {
    throw new TryOnError("generation", explainMissingImage(data));
  }

  const payload = image.inlineData || image.inline_data;

  // A data: URI keeps the contract identical to a URL-returning provider: the
  // controller uploads it to Cloudinary, and it still renders in an <img src>
  // untouched if that upload fails.
  const mime = payload.mimeType || payload.mime_type || "image/png";

  return `data:${mime};base64,${payload.data}`;
};

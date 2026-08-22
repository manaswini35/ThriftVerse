// Wrapper around the FASHN virtual try-on API.
// Docs: https://docs.fashn.ai/api-overview/api-fundamentals
//
// The flow is: POST /v1/run returns a prediction id, then you poll
// GET /v1/status/{id} until status flips to "completed" or "failed".

const BASE = "https://api.fashn.ai/v1";

// tryon-v1.6 is the cheaper, faster model (roughly 5-17s) — the right
// default for an interactive feature. Switch TRYON_MODEL to "tryon-max"
// in .env if you want the higher-fidelity, slower one.
const MODEL = process.env.TRYON_MODEL || "tryon-v1.6";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const headers = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.FASHN_API_KEY}`,
});

export const isConfigured = () => Boolean(process.env.FASHN_API_KEY);

export const runTryOn = async ({ personImageUrl, garmentImageUrl }) => {
  if (!isConfigured()) {
    throw new Error(
      "Virtual try-on isn't configured. Add FASHN_API_KEY to your .env."
    );
  }

  const start = await fetch(`${BASE}/run`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({
      model_name: MODEL,
      inputs: {
        model_image: personImageUrl,
        product_image: garmentImageUrl,
      },
    }),
  });

  const started = await start.json();

  // Auth and validation failures happen before a prediction id is issued.
  if (!start.ok || !started.id) {
    throw new Error(started.message || started.error || "Try-on request failed");
  }

  // Poll. The rate limit is 50 status calls per 10s, so 2s intervals are safe.
  // 60 attempts caps us at ~2 minutes rather than hanging the request forever.
  for (let i = 0; i < 60; i++) {
    await sleep(2000);

    const res = await fetch(`${BASE}/status/${started.id}`, {
      headers: headers(),
    });

    const data = await res.json();

    if (data.status === "completed") {
      const url = data.output?.[0];
      if (!url) throw new Error("Try-on finished but returned no image");
      return url;
    }

    if (data.status === "failed") {
      throw new Error(data.error?.message || "Try-on generation failed");
    }
  }

  throw new Error("Try-on timed out. Try again in a minute.");
};

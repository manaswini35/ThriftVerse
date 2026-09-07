import api from "./api";

// Every try-on call in one place. The photo goes up as multipart — a 4MB
// selfie as base64 JSON would be a third bigger and slower on mobile data.

export const MAX_BYTES = 5 * 1024 * 1024;
const TYPES = ["image/jpeg", "image/jpg", "image/png"];

// Checked in the browser so an obviously wrong file never costs an upload.
// The server enforces the same rules independently.
export function checkPhoto(file) {
  if (!file) return "Choose a photo first.";

  if (!TYPES.includes(file.type)) {
    return "That file type won't work. Use a JPG, JPEG or PNG.";
  }

  if (file.size > MAX_BYTES) {
    return "That photo is over 5MB. Try a smaller one.";
  }

  return "";
}

export async function fetchTryOnStatus() {
  const res = await api.get("/virtual-tryon/status");
  return res.data;
}

export async function requestTryOn({ photo, productId, signal }) {
  const form = new FormData();

  form.append("photo", photo);
  form.append("productId", productId);

  const res = await api.post("/virtual-tryon", form, {
    signal,
    // Generation takes ~5-40s and can reach two minutes on the slower model.
    timeout: 150000,
  });

  return res.data;
}

// Maps a failed request onto one of the UI's error states so the modal can
// show the right recovery action instead of a generic "something broke".
export function classifyError(err) {
  if (err?.code === "ERR_CANCELED") return { state: "IDLE", message: "" };

  if (err?.code === "ECONNABORTED") {
    return {
      state: "NETWORK_ERROR",
      message: "That took too long. The service may be busy — try again.",
    };
  }

  if (!err?.response) {
    return {
      state: "NETWORK_ERROR",
      message: "Couldn't reach ThriftVerse. Check your connection and try again.",
    };
  }

  const { status, data } = err.response;
  const message = data?.message || "Your try-on couldn't be created.";

  if (status === 400) return { state: "INVALID_IMAGE", message };
  if (status === 401) {
    return { state: "AI_ERROR", message: "Please log in to use try-on." };
  }

  return { state: "AI_ERROR", message };
}

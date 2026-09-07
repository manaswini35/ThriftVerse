import express from "express";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";

import { createTryOn, getTryOnStatus } from "../controllers/tryOnController.js";
import protect from "../middlewares/authMiddlewares.js";
import upload from "../middlewares/upload.js";

const router = express.Router();

// Every generation costs money and provider quota, so this is capped per
// account rather than per IP — a shared college network shouldn't lock
// everyone out because one person experimented.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  // ipKeyGenerator normalises IPv6 into a /64 block. express-rate-limit
  // refuses to start without it when a custom generator touches req.ip,
  // because a raw v6 address lets one user rotate through addresses freely.
  keyGenerator: (req) => req.user?.id || ipKeyGenerator(req.ip),
  message: {
    message: "That's a lot of try-ons. Give it fifteen minutes and come back.",
    kind: "busy",
  },
});

// Cheap and public: lets the product page decide whether to offer the button
// at all, instead of promising a feature the server can't deliver.
router.get("/status", getTryOnStatus);

// upload.single() enforces the 5MB / image-only rules already used for
// listing photos.
router.post("/", protect, limiter, upload.single("photo"), createTryOn);

export default router;

import express from "express";
import {
  googleMobileCallback,
  googleRedirectHandler,
  refreshAccessToken
} from "../controllers/auth.controller";

const router = express.Router();

// OAuth
router.post("/google/mobile/callback", googleMobileCallback);
router.get("/google/redirect", googleRedirectHandler);

// Refresh token
router.post("/refresh", refreshAccessToken);

export default router;

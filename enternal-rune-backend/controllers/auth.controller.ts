import { Request, Response, NextFunction } from "express";
import axios from "axios";
import jwt from "jsonwebtoken";
import { CatchAsyncError } from "../middleware/catchAsyncErrors";
import userModel, { IUser } from "../models/user.model";
import { redis } from "../utils/redis";
import ErrorHandler from "../utils/ErrorHandler";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const GOOGLE_USERINFO_ENDPOINT = "https://www.googleapis.com/oauth2/v3/userinfo";

const createAppAccessToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || "15m",
  });
};

const createAppRefreshToken = (userId: string) => {
  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  });
};

// POST /auth/google/mobile/callback
export const googleMobileCallback = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code, code_verifier } = req.body as { code?: string; code_verifier?: string };

    if (!code) {
      return next(new ErrorHandler("Missing authorization code", 400));
    }
    try {
      // Exchange code for tokens
      const params = new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: (process.env.APP_BASE_URL || "") + "/auth/google/redirect",
        grant_type: "authorization_code",
      });

      // If you used PKCE and included code_verifier on auth request, include it here:
      if (code_verifier) params.append("code_verifier", code_verifier);

      const tokenResp = await axios.post(GOOGLE_TOKEN_ENDPOINT, params.toString(), {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const tokenData = tokenResp.data;
      const accessToken = tokenData.access_token;
      const idToken = tokenData.id_token; // optional, contains JWT with profile

      // fetch user profile from Google
      const profileResp = await axios.get(GOOGLE_USERINFO_ENDPOINT, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const profile = profileResp.data;
      // profile example: {sub, name, given_name, family_name, picture, email, email_verified, locale}

      // find or create user in DB
      let user = await userModel.findOne({ email: profile.email });
      if (!user) {
        user = await userModel.create({
          name: profile.name || profile.email.split("@")[0],
          email: profile.email,
          password: Math.random().toString(36).slice(-12), // random, user can change later
          avatar: { url: profile.picture || "", public_id: "" },
          isVerified: profile.email_verified || false,
          role: "user",
        });
      } else {
        // optionally update avatar/name if empty
        if (!user.avatar?.url && profile.picture) {
          user.avatar = { url: profile.picture, public_id: "" };
          await user.save();
        }
      }

      // create app tokens
      const appAccessToken = createAppAccessToken(user._id.toString());
      const appRefreshToken = createAppRefreshToken(user._id.toString());

      // store user in redis for quick auth lookup (the middleware uses redis.get(decoded.id))
      await redis.set(user._id.toString(), JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        courses: user.courses,
      }), "EX", 7 * 24 * 3600); // cache 7 days

      // store refresh token in redis (or DB). Key: refresh_{userId}
      await redis.set(`refresh_${user._id.toString()}`, appRefreshToken, "EX", 30 * 24 * 3600);

      // return tokens and user
      res.status(200).json({
        success: true,
        token: appAccessToken,
        refreshToken: appRefreshToken,
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          avatar: user.avatar,
          role: user.role,
          courses: user.courses,
        },
      });
    } catch (err: any) {
      console.error("googleMobileCallback error:", err.response?.data || err.message);
      return next(new ErrorHandler("Google OAuth failed", 500));
    }
  }
);

// Optional: web redirect handler (if you register redirect_uri pointing to backend)
// GET /auth/google/redirect?code=...
export const googleRedirectHandler = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { code } = req.query;
    if (!code) {
      return res.status(400).send("Missing code");
    }
    const frontendUrl = process.env.FRONTEND_URL || "myapp://oauth"; // set accordingly
    return res.redirect(`${frontendUrl}?code=${encodeURIComponent(code as string)}`);
  }
);
export const refreshAccessToken = CatchAsyncError(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ErrorHandler("No refresh token", 400));
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as any;
    const userId = decoded.id;

    const stored = await redis.get(`refresh_${userId}`);
    if (!stored || stored !== refreshToken) {
      return next(new ErrorHandler("Invalid refresh token", 401));
    }

    const newAccess = jwt.sign(
      { id: userId },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
    );

    res.json({ success: true, token: newAccess });
  } catch (err) {
    return next(new ErrorHandler("Refresh token invalid", 401));
  }
});

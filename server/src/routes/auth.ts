import { Router, Request } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import crypto from "crypto";
import User from "../models/User";
import { signAccess, signRefresh, verifyRefresh } from "../lib/jwt";
import { env } from "../config/env";
import { ApiError, errors } from "../utils/ApiError";
import { requireAuth } from "../middleware/requireAuth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from "dotenv";
import sharp from "sharp";

dotenv.config();
const router = Router();
const multer = require("multer");

const BUCKET_NAME = process.env.PROFILE_BUCKET_NAME!;
const BUCKET_REGION = process.env.PROFILE_BUCKET_REGION!;
const ACCESS_KEY = process.env.PROFILE_ACCESS_KEY!;
const SECRET_ACCESS_KEY = process.env.PROFILE_SECRET_ACCESS_KEY!;

const s3 = new S3Client({
  region: BUCKET_REGION,
  credentials: {
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_ACCESS_KEY,
  },
});

// Type for multer request
interface MulterRequest extends Request {
  file?: {
    originalname: string;
    mimetype: string;
    size: number;
    buffer: Buffer;
  };
}

const storage = multer.memoryStorage();
const upload = multer({ storage });

// --- schemas
const RegisterSchema = z.object({
  name: z.string().min(1).max(80),
  email: z.string().email(),
  password: z.string().min(6).max(128),
});
const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

// --- routes
router.post("/register", async (req, res) => {
  const { name, email, password } = RegisterSchema.parse(req.body);

  const exists = await User.findOne({ email });
  if (exists) throw errors.conflict("Email already in use");

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await User.create({
    name,
    email,
    passwordHash,
    providers: [],
    sessions: [],
    phone: null,
    address: null,
    dob: null,
    gender: null,
    height: null,
    weight: null,
    profilePicture: null,
    schemaVersion: 2,
  });

  const tokenId = crypto.randomUUID().toString();
  user.sessions.push({ tokenId });
  await user.save();

  const access = signAccess({ sub: user.id });
  const refresh = signRefresh({ sub: user.id, jti: tokenId });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      profilePicture: user.profilePicture,
    },
    accessToken: access,
    refreshToken: refresh,
  });
});

router.post("/login", async (req, res) => {
  const { email, password } = LoginSchema.parse(req.body);

  const user = await User.findOne({ email });
  if (!user || !user.passwordHash) throw errors.authInvalid();

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw errors.authInvalid();

  const tokenId = crypto.randomUUID();
  user.sessions.push({ tokenId });
  await user.save();

  const access = signAccess({ sub: user.id });
  const refresh = signRefresh({ sub: user.id, jti: tokenId });
  res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      profilePicture: user.profilePicture,
    },
    accessToken: access,
    refreshToken: refresh,
  });
});

router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    const access = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
    if (!access) return res.json({ user: null });

    const { verifyAccess } = await import("../lib/jwt");
    const payload = verifyAccess(access);
    const user = await User.findById(payload.sub);
    return res.json({
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            dob: user.dob,
            gender: user.gender,
            height: user.height,
            weight: user.weight,
            profilePicture: user.profilePicture,
          }
        : null,
    });
  } catch {
    return res.json({ user: null });
  }
});

router.post("/refresh", async (req, res) => {
  const { refreshToken } = req.body; // Expect refresh token in body
  console.log("Received refreshToken:", refreshToken);

  // Debug: print session array before update
  let userForDebug = null;
  try {
    const payload = verifyRefresh(refreshToken);
    userForDebug = await User.findById(payload.sub);
    if (userForDebug) {
      console.log("User sessions BEFORE update:", userForDebug.sessions);
    }
  } catch (e) {
    console.log("Error verifying refresh token for debug:", e);
  }
  if (!refreshToken) {
    console.log("No refresh token provided");
    throw errors.authInvalid();
  }

  let payload: any;
  try {
    payload = verifyRefresh(refreshToken);
    console.log("Refresh token payload:", payload);
  } catch {
    res.status(401).json({ error: "Invalid refresh token" });
    throw errors.authInvalid();
  }

  const user = await User.findById(payload.sub);
  if (!user) {
    console.log("User not found for refresh token");
    throw errors.authInvalid();
  }

  const exists = user.sessions.some((s) => s.tokenId === payload.jti);
  console.log(
    "Checking for session tokenId in user.sessions:",
    payload.jti,
    user.sessions
  );
  console.log("Rotating refresh token, removing old and adding new session");
  if (!exists) {
    console.log("Refresh token session not found");
    throw errors.authInvalid(); // revoked/rotated
  }

  // Only rotate if token is close to expiring (less than 1 day left)
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = payload.exp - now;
  let newId = payload.jti;
  let refresh = refreshToken;
  if (expiresIn < 86400) {
    // less than 1 day left
    newId = crypto.randomUUID();
    // Remove old session
    await User.updateOne(
      { _id: user._id },
      { $pull: { sessions: { tokenId: payload.jti } } }
    );
    // Add new session
    await User.updateOne(
      { _id: user._id },
      { $push: { sessions: { tokenId: newId, createdAt: new Date() } } }
    );
    refresh = signRefresh({ sub: user.id, jti: newId });
  }
  const access = signAccess({ sub: user.id });
  // Debug: print session array after update
  const userAfterUpdate = await User.findById(user._id);
  if (userAfterUpdate) {
    console.log("User sessions AFTER update:", userAfterUpdate.sessions);
  }
  res.json({
    accessToken: access,
    refreshToken: refresh,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
      dob: user.dob,
      gender: user.gender,
      height: user.height,
      weight: user.weight,
      profilePicture: user.profilePicture,
    },
  });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const userId = (req as any).user.userId as string;

  // Ensure user can only update their own profile
  if (id !== userId) {
    return res
      .status(403)
      .json({ error: "Forbidden: Can only update your own profile" });
  }

  try {
    const user = await User.findByIdAndUpdate(id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    res.status(400).json({ error: "Failed to update user" });
  }
});

router.post(
  "/:id/profileImage",
  requireAuth,
  upload.single("profilePicture"),
  async (req: MulterRequest, res) => {
    try {
      const { id } = req.params;
      const userId = (req as any).user.userId as string;

      // Ensure user can only upload to their own profile
      if (id !== userId) {
        return res
          .status(403)
          .json({ error: "Forbidden: Can only upload to your own profile" });
      }

      console.log("Request body: ", req.body);
      console.log("Request file: ", req.file);

      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const params = {
        Bucket: BUCKET_NAME,
        Key: `profile-images/${id}/profilePicture`,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const bufferSmall = await sharp(req.file.buffer)
        .resize({ width: 100, height: 100, fit: "cover" })
        .toBuffer();

      const params2 = {
        Bucket: BUCKET_NAME,
        Key: `profile-images/${id}/profilePicture-small`,
        Body: bufferSmall,
        ContentType: req.file.mimetype,
      };

      const command = new PutObjectCommand(params);
      const command2 = new PutObjectCommand(params2);
      await s3.send(command);
      await s3.send(command2);

      // Construct URLs for the uploaded images
      const originalUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${params.Key}`;
      const thumbnailUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${params2.Key}`;

      // Update user profile with image URLs in database
      const updatedUser = await User.findByIdAndUpdate(
        id,
        {
          profilePicture: {
            original: originalUrl,
            thumbnail: thumbnailUrl,
            uploadedAt: new Date(),
          },
        },
        { new: true }
      );

      res.json({
        success: true,
        message: "Profile image uploaded successfully",
        profilePicture: {
          original: originalUrl,
          thumbnail: thumbnailUrl,
          uploadedAt: new Date(),
        },
        user: updatedUser,
      });
    } catch (error) {
      console.error("Profile image upload error:", error);
      res.status(500).json({ error: "Failed to upload profile image" });
    }
  }
);

router.post("/logout", async (req, res) => {
  const { refreshToken } = req.body; // Expect refresh token in body
  if (refreshToken) {
    try {
      const payload = verifyRefresh(refreshToken);
      const user = await User.findById(payload.sub);
      if (user) {
        await User.updateOne(
          { _id: user._id },
          {
            $pull: { sessions: { tokenId: payload.jti } },
          }
        );
      }
    } catch {
      /* ignore */
    }
  }
  res.json({ ok: true });
});

export default router;

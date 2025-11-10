"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = __importDefault(require("crypto"));
const User_1 = __importDefault(require("../models/User"));
const jwt_1 = require("../lib/jwt");
const ApiError_1 = require("../utils/ApiError");
const requireAuth_1 = require("../middleware/requireAuth");
const client_s3_1 = require("@aws-sdk/client-s3");
const dotenv_1 = __importDefault(require("dotenv"));
const sharp_1 = __importDefault(require("sharp"));
dotenv_1.default.config();
const router = (0, express_1.Router)();
const multer = require("multer");
const BUCKET_NAME = process.env.PROFILE_BUCKET_NAME;
const BUCKET_REGION = process.env.PROFILE_BUCKET_REGION;
const ACCESS_KEY = process.env.PROFILE_ACCESS_KEY;
const SECRET_ACCESS_KEY = process.env.PROFILE_SECRET_ACCESS_KEY;
const s3 = new client_s3_1.S3Client({
    region: BUCKET_REGION,
    credentials: {
        accessKeyId: ACCESS_KEY,
        secretAccessKey: SECRET_ACCESS_KEY,
    },
});
const storage = multer.memoryStorage();
const upload = multer({ storage });
// --- schemas
const RegisterSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(80),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(128),
});
const LoginSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(6).max(128),
});
// --- routes
router.post("/register", async (req, res) => {
    const { name, email, password } = RegisterSchema.parse(req.body);
    const exists = await User_1.default.findOne({ email });
    if (exists)
        throw ApiError_1.errors.conflict("Email already in use");
    const passwordHash = await bcrypt_1.default.hash(password, 12);
    const user = await User_1.default.create({
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
    const tokenId = crypto_1.default.randomUUID().toString();
    user.sessions.push({ tokenId });
    await user.save();
    const access = (0, jwt_1.signAccess)({ sub: user.id });
    const refresh = (0, jwt_1.signRefresh)({ sub: user.id, jti: tokenId });
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
    const user = await User_1.default.findOne({ email });
    if (!user || !user.passwordHash)
        throw ApiError_1.errors.authInvalid();
    const ok = await bcrypt_1.default.compare(password, user.passwordHash);
    if (!ok)
        throw ApiError_1.errors.authInvalid();
    const tokenId = crypto_1.default.randomUUID();
    user.sessions.push({ tokenId });
    await user.save();
    const access = (0, jwt_1.signAccess)({ sub: user.id });
    const refresh = (0, jwt_1.signRefresh)({ sub: user.id, jti: tokenId });
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
            favoriteWorkouts: user.favoriteWorkouts,
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
        if (!access)
            return res.json({ user: null });
        const { verifyAccess } = await Promise.resolve().then(() => __importStar(require("../lib/jwt")));
        const payload = verifyAccess(access);
        const user = await User_1.default.findById(payload.sub);
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
                    favoriteWorkouts: user.favoriteWorkouts,
                }
                : null,
        });
    }
    catch {
        return res.json({ user: null });
    }
});
router.post("/refresh", async (req, res) => {
    const { refreshToken } = req.body; // Expect refresh token in body
    console.log("Received refreshToken:", refreshToken);
    // Debug: print session array before update
    let userForDebug = null;
    try {
        const payload = (0, jwt_1.verifyRefresh)(refreshToken);
        userForDebug = await User_1.default.findById(payload.sub);
        if (userForDebug) {
            console.log("User sessions BEFORE update:", userForDebug.sessions);
        }
    }
    catch (e) {
        console.log("Error verifying refresh token for debug:", e);
    }
    if (!refreshToken) {
        console.log("No refresh token provided");
        throw ApiError_1.errors.authInvalid();
    }
    let payload;
    try {
        payload = (0, jwt_1.verifyRefresh)(refreshToken);
        console.log("Refresh token payload:", payload);
    }
    catch {
        res.status(401).json({ error: "Invalid refresh token" });
        throw ApiError_1.errors.authInvalid();
    }
    const user = await User_1.default.findById(payload.sub);
    if (!user) {
        console.log("User not found for refresh token");
        throw ApiError_1.errors.authInvalid();
    }
    const exists = user.sessions.some((s) => s.tokenId === payload.jti);
    console.log("Checking for session tokenId in user.sessions:", payload.jti, user.sessions);
    console.log("Rotating refresh token, removing old and adding new session");
    if (!exists) {
        console.log("Refresh token session not found");
        throw ApiError_1.errors.authInvalid(); // revoked/rotated
    }
    // Only rotate if token is close to expiring (less than 1 day left)
    const now = Math.floor(Date.now() / 1000);
    const expiresIn = payload.exp - now;
    let newId = payload.jti;
    let refresh = refreshToken;
    if (expiresIn < 86400) {
        // less than 1 day left
        newId = crypto_1.default.randomUUID();
        // Remove old session
        await User_1.default.updateOne({ _id: user._id }, { $pull: { sessions: { tokenId: payload.jti } } });
        // Add new session
        await User_1.default.updateOne({ _id: user._id }, { $push: { sessions: { tokenId: newId, createdAt: new Date() } } });
        refresh = (0, jwt_1.signRefresh)({ sub: user.id, jti: newId });
    }
    const access = (0, jwt_1.signAccess)({ sub: user.id });
    // Debug: print session array after update
    const userAfterUpdate = await User_1.default.findById(user._id);
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
            favoriteWorkouts: user.favoriteWorkouts,
        },
    });
});
router.patch("/:id", requireAuth_1.requireAuth, async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user.userId;
    // Ensure user can only update their own profile
    if (id !== userId) {
        return res
            .status(403)
            .json({ error: "Forbidden: Can only update your own profile" });
    }
    try {
        const user = await User_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        res.json({ user });
    }
    catch (error) {
        res.status(400).json({ error: "Failed to update user" });
    }
});
router.post("/:id/profileImage", requireAuth_1.requireAuth, upload.single("profilePicture"), async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
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
        const bufferSmall = await (0, sharp_1.default)(req.file.buffer)
            .resize({ width: 100, height: 100, fit: "cover" })
            .toBuffer();
        const params2 = {
            Bucket: BUCKET_NAME,
            Key: `profile-images/${id}/profilePicture-small`,
            Body: bufferSmall,
            ContentType: req.file.mimetype,
        };
        const command = new client_s3_1.PutObjectCommand(params);
        const command2 = new client_s3_1.PutObjectCommand(params2);
        await s3.send(command);
        await s3.send(command2);
        // Construct URLs for the uploaded images
        const originalUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${params.Key}`;
        const thumbnailUrl = `https://${BUCKET_NAME}.s3.${BUCKET_REGION}.amazonaws.com/${params2.Key}`;
        // Update user profile with image URLs in database
        const updatedUser = await User_1.default.findByIdAndUpdate(id, {
            profilePicture: {
                original: originalUrl,
                thumbnail: thumbnailUrl,
                uploadedAt: new Date(),
            },
        }, { new: true });
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
    }
    catch (error) {
        console.error("Profile image upload error:", error);
        res.status(500).json({ error: "Failed to upload profile image" });
    }
});
router.post("/logout", async (req, res) => {
    const { refreshToken } = req.body; // Expect refresh token in body
    if (refreshToken) {
        try {
            const payload = (0, jwt_1.verifyRefresh)(refreshToken);
            const user = await User_1.default.findById(payload.sub);
            if (user) {
                await User_1.default.updateOne({ _id: user._id }, {
                    $pull: { sessions: { tokenId: payload.jti } },
                });
            }
        }
        catch {
            /* ignore */
        }
    }
    res.json({ ok: true });
});
// Add/remove workout from user favorites
router.post("/favorites/workouts/:workoutId", requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.user.userId;
    const { workoutId } = req.params;
    const { action } = req.body; // 'add' or 'remove'
    try {
        if (action === "add") {
            await User_1.default.updateOne({ _id: userId }, { $addToSet: { favoriteWorkouts: workoutId } } // $addToSet prevents duplicates
            );
        }
        else if (action === "remove") {
            await User_1.default.updateOne({ _id: userId }, { $pull: { favoriteWorkouts: workoutId } });
        }
        else {
            return res
                .status(400)
                .json({ error: "Invalid action. Use 'add' or 'remove'" });
        }
        // Get updated user favorites
        const user = await User_1.default.findById(userId, { favoriteWorkouts: 1 });
        const isFavorite = user?.favoriteWorkouts?.includes(workoutId) || false;
        res.json({ ok: true, isFavorite });
    }
    catch (error) {
        console.error("Error updating workout favorites:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
// Get user's favorite workouts
router.get("/favorites/workouts", requireAuth_1.requireAuth, async (req, res) => {
    const userId = req.user.userId;
    try {
        const user = await User_1.default.findById(userId, { favoriteWorkouts: 1 });
        res.json({ favoriteWorkouts: user?.favoriteWorkouts || [] });
    }
    catch (error) {
        console.error("Error fetching workout favorites:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});
exports.default = router;

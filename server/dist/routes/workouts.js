"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const Workout_1 = __importDefault(require("../models/Workout"));
const Exercise_1 = __importDefault(require("../models/Exercise"));
const requireAuth_1 = require("../middleware/requireAuth");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
// --- Schemas
const ItemSchema = zod_1.z.object({
    exerciseId: zod_1.z.string().min(1),
    sets: zod_1.z.number().int().min(1).max(20).optional(),
    reps: zod_1.z
        .union([
        zod_1.z.number().int().min(1).max(100),
        zod_1.z.string().regex(/^\d{1,3}-\d{1,3}$/),
    ])
        .optional(),
    restSecs: zod_1.z.number().int().min(0).max(600).optional(),
});
const BlockSchema = zod_1.z.object({
    title: zod_1.z.string().max(80).optional(),
    items: zod_1.z.array(ItemSchema).min(1),
});
const CreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).max(80),
    description: zod_1.z.string().max(500).optional(),
    type: zod_1.z
        .enum(["strength", "endurance", "sport", "speed", "other"])
        .default("strength"),
    tags: zod_1.z.array(zod_1.z.string().max(30)).max(12).optional(),
    blocks: zod_1.z.array(BlockSchema).min(1).max(6),
});
const ListQuery = zod_1.z.object({
    favoritesOnly: zod_1.z.coerce.boolean().optional(),
    query: zod_1.z.string().trim().max(80).optional(),
    limit: zod_1.z.coerce.number().int().min(1).max(50).default(20),
    cursor: zod_1.z.string().optional(),
    scope: zod_1.z.enum(["mine", "global", "all"]).default("mine"),
});
// --- Create
router.post("/", async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const dto = CreateSchema.parse(req.body);
        // Optional: uniqueness by name per user
        const exists = await Workout_1.default.exists({ userId, name: dto.name });
        if (exists) {
            return res.status(409).json({
                error: "DUPLICATE",
                message: "You already have a workout with this name.",
            });
        }
        // Ensure all exercises exist & are visible
        const exerciseIds = dto.blocks.flatMap((b) => b.items.map((i) => i.exerciseId));
        const distinct = [...new Set(exerciseIds)];
        const found = await Exercise_1.default.countDocuments({
            _id: { $in: distinct.map((id) => new mongoose_1.Types.ObjectId(id)) },
            author: { $in: ["global", userId] },
        });
        if (found !== distinct.length) {
            return res.status(400).json({
                error: "VALIDATION_FAILED",
                message: "One or more exercises are invalid or not accessible.",
            });
        }
        const doc = await Workout_1.default.create({
            userId,
            author: userId,
            name: dto.name,
            description: dto.description,
            type: dto.type,
            tags: dto.tags ?? [],
            isFavorite: false,
            blocks: dto.blocks.map((b) => ({
                title: b.title,
                items: b.items.map((i) => ({
                    exerciseId: new mongoose_1.Types.ObjectId(i.exerciseId),
                    sets: i.sets,
                    reps: i.reps,
                    restSecs: i.restSecs,
                })),
            })),
        });
        const out = doc.toObject();
        res.status(201).json({
            id: String(out._id),
            name: out.name,
            description: out.description ?? "",
            type: out.type,
            tags: out.tags ?? [],
            image: out.image ?? null,
            isFavorite: !!out.isFavorite,
            updatedAt: out.updatedAt,
            blocks: out.blocks?.map((b) => ({
                title: b.title,
                items: (b.items ?? []).map((i) => ({
                    exerciseId: String(i.exerciseId),
                    sets: i.sets ?? null,
                    reps: i.reps ?? null,
                    restSecs: i.restSecs ?? null,
                })),
            })),
        });
    }
    catch (e) {
        next(e);
    }
});
// --- List (Featured/Library/Favorites)
router.get("/", async (req, res) => {
    const userId = req.user.userId;
    const { scope, favoritesOnly, query, limit, cursor } = ListQuery.parse(req.query);
    const filter = {}; // <-- start empty
    if (scope === "mine")
        filter.userId = userId;
    if (scope === "global")
        filter.author = "global";
    if (scope === "all")
        filter.$or = [{ userId }, { author: "global" }];
    if (favoritesOnly)
        filter.isFavorite = true;
    if (query)
        filter.name = { $regex: query, $options: "i" };
    if (cursor)
        filter._id = { $lt: new mongoose_1.Types.ObjectId(cursor) };
    const docs = await Workout_1.default.find(filter)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .select("name tags image type isFavorite updatedAt blocks description author")
        .lean();
    const nextCursor = docs.length > limit ? String(docs[limit]._id) : null;
    const items = docs.slice(0, limit).map((d) => ({
        id: String(d._id),
        name: d.name,
        tags: d.tags ?? [],
        image: d.image ?? null, // include for cards
        isFavorite: !!d.isFavorite,
        updatedAt: d.updatedAt,
        author: d.author,
        type: d.type ?? "d has no type",
        description: d.description ?? "",
        blocks: d.blocks?.map((b) => ({
            title: b.title,
            items: (b.items ?? []).map((i) => ({
                exerciseId: String(i.exerciseId),
                sets: i.sets ?? null,
                reps: i.reps ?? null,
                restSecs: i.restSecs ?? null,
                name: i.name ?? undefined,
            })),
        })),
    }));
    res.json({ items, nextCursor });
});
// --- Get one
router.get("/:id", async (req, res) => {
    const userId = req.user.userId;
    const id = req.params.id;
    //const doc = await Workout.findOne({ _id: id, userId }).lean();
    const doc = await Workout_1.default.findOne({
        _id: id,
        $or: [{ userId }, { author: "global" }],
    }).lean();
    if (!doc)
        return res
            .status(404)
            .json({ error: "NOT_FOUND", message: "Workout not found" });
    res.json({ id: String(doc._id), ...doc, _id: undefined });
});
// --- Toggle favorite
router.post("/:id/favorite", async (req, res) => {
    const userId = req.user.userId;
    const id = req.params.id;
    const value = !!req.body?.value;
    const updated = await Workout_1.default.findOneAndUpdate({ _id: id, userId }, { $set: { isFavorite: value } }, { new: true, projection: { isFavorite: 1 } });
    if (!updated)
        return res
            .status(404)
            .json({ error: "NOT_FOUND", message: "Workout not found" });
    res.json({ ok: true, isFavorite: updated.isFavorite });
});
// PATCH /workouts/:id  (owner-only)
router.patch("/:id", async (req, res, next) => {
    try {
        const userId = req.user.userId;
        const id = req.params.id;
        const existing = await Workout_1.default.findOne({ _id: id, userId });
        if (!existing) {
            return res
                .status(404)
                .json({ error: "NOT_FOUND", message: "Workout not found" });
        }
        // Accept partial payload similar to your Create schema
        const Partial = CreateSchema.partial();
        const dto = Partial.parse(req.body);
        if (dto.name !== undefined)
            existing.name = dto.name;
        if (dto.description !== undefined)
            existing.description = dto.description ?? "";
        if (dto.type !== undefined)
            existing.type = dto.type;
        if (dto.tags !== undefined)
            existing.tags = dto.tags ?? [];
        if (dto.blocks !== undefined) {
            existing.blocks = dto.blocks.map((b) => ({
                title: b.title,
                items: b.items.map((i) => ({
                    exerciseId: new mongoose_1.Types.ObjectId(i.exerciseId),
                    sets: i.sets,
                    reps: i.reps,
                    restSecs: i.restSecs,
                })),
            }));
        }
        await existing.save();
        const out = existing.toObject();
        res.json({ id: String(out._id), ...out, _id: undefined });
    }
    catch (e) {
        next(e);
    }
});
// DELETE /workouts/:id  (owner-only; global not allowed)
router.delete("/:id", async (req, res) => {
    const userId = req.user.userId;
    const id = req.params.id;
    const deleted = await Workout_1.default.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
        return res
            .status(404)
            .json({ error: "NOT_FOUND", message: "Workout not found or not yours" });
    }
    res.status(204).end();
});
exports.default = router;

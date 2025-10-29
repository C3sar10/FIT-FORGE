import { Router } from "express";
import { z } from "zod";
import Workout from "../models/Workout";
import Exercise from "../models/Exercise";
import { requireAuth } from "../middleware/requireAuth";
import { Types } from "mongoose";

const router = Router();
router.use(requireAuth);

// --- Schemas
const ItemSchema = z.object({
  exerciseId: z.string().min(1),
  sets: z.number().int().min(1).max(20).optional(),
  reps: z
    .union([
      z.number().int().min(1).max(100),
      z.string().regex(/^\d{1,3}-\d{1,3}$/),
    ])
    .optional(),
  restSecs: z.number().int().min(0).max(600).optional(),
});
const BlockSchema = z.object({
  title: z.string().max(80).optional(),
  items: z.array(ItemSchema).min(1),
});
const CreateSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  type: z
    .enum(["strength", "endurance", "sport", "speed", "other"])
    .default("strength"),
  tags: z.array(z.string().max(30)).max(12).optional(),
  blocks: z.array(BlockSchema).min(1).max(6),
});

const ListQuery = z.object({
  favoritesOnly: z.coerce.boolean().optional(),
  query: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(),
  scope: z.enum(["mine", "global", "all"]).default("mine"),
});

// --- Create
router.post("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;
    const dto = CreateSchema.parse(req.body);

    // Optional: uniqueness by name per user
    const exists = await Workout.exists({ userId, name: dto.name });
    if (exists) {
      return res.status(409).json({
        error: "DUPLICATE",
        message: "You already have a workout with this name.",
      });
    }

    // Ensure all exercises exist & are visible
    const exerciseIds = dto.blocks.flatMap((b) =>
      b.items.map((i) => i.exerciseId)
    );
    const distinct = [...new Set(exerciseIds)];
    const found = await Exercise.countDocuments({
      _id: { $in: distinct.map((id) => new Types.ObjectId(id)) },
      author: { $in: ["global", userId] },
    });
    if (found !== distinct.length) {
      return res.status(400).json({
        error: "VALIDATION_FAILED",
        message: "One or more exercises are invalid or not accessible.",
      });
    }

    const doc = await Workout.create({
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
          exerciseId: new Types.ObjectId(i.exerciseId),
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
      blocks: out.blocks?.map((b: any) => ({
        title: b.title,
        items: (b.items ?? []).map((i: any) => ({
          exerciseId: String(i.exerciseId),
          sets: i.sets ?? null,
          reps: i.reps ?? null,
          restSecs: i.restSecs ?? null,
        })),
      })),
    });
  } catch (e) {
    next(e);
  }
});

// --- List (Featured/Library/Favorites)
router.get("/", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const { scope, favoritesOnly, query, limit, cursor } = ListQuery.parse(
    req.query
  );

  const filter: any = {}; // <-- start empty

  if (scope === "mine") filter.userId = userId;
  if (scope === "global") filter.author = "global";
  if (scope === "all") filter.$or = [{ userId }, { author: "global" }];

  if (favoritesOnly) filter.isFavorite = true;
  if (query) filter.name = { $regex: query, $options: "i" };
  if (cursor) filter._id = { $lt: new Types.ObjectId(cursor) };

  const docs = await Workout.find(filter)
    .sort({ _id: -1 })
    .limit(limit + 1)
    .select(
      "name tags image type isFavorite updatedAt blocks description author"
    )
    .lean();

  const nextCursor = docs.length > limit ? String(docs[limit]._id) : null;

  const items = (docs as any[]).slice(0, limit).map((d) => ({
    id: String(d._id),
    name: d.name,
    tags: d.tags ?? [],
    image: d.image ?? null, // include for cards
    isFavorite: !!d.isFavorite,
    updatedAt: d.updatedAt,
    author: d.author,
    type: d.type ?? "d has no type",
    description: d.description ?? "",
    blocks: d.blocks?.map((b: any) => ({
      title: b.title,
      items: (b.items ?? []).map((i: any) => ({
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
  const userId = (req as any).user.userId as string;
  const id = req.params.id;
  //const doc = await Workout.findOne({ _id: id, userId }).lean();
  const doc = await Workout.findOne({
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
  const userId = (req as any).user.userId as string;
  const id = req.params.id;
  const value = !!req.body?.value;
  const updated = await Workout.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isFavorite: value } },
    { new: true, projection: { isFavorite: 1 } }
  );
  if (!updated)
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Workout not found" });
  res.json({ ok: true, isFavorite: updated.isFavorite });
});

// PATCH /workouts/:id  (owner-only)
router.patch("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;
    const id = req.params.id;

    const existing = await Workout.findOne({ _id: id, userId });
    if (!existing) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Workout not found" });
    }

    // Accept partial payload similar to your Create schema
    const Partial = CreateSchema.partial();
    const dto = Partial.parse(req.body);

    if (dto.name !== undefined) existing.name = dto.name;
    if (dto.description !== undefined)
      existing.description = dto.description ?? "";
    if (dto.type !== undefined) existing.type = dto.type;
    if (dto.tags !== undefined) existing.tags = dto.tags ?? [];
    if (dto.blocks !== undefined) {
      existing.blocks = dto.blocks.map((b) => ({
        title: b.title,
        items: b.items.map((i) => ({
          exerciseId: new Types.ObjectId(i.exerciseId),
          sets: i.sets,
          reps: i.reps,
          restSecs: i.restSecs,
        })),
      })) as any;
    }

    await existing.save();

    const out = existing.toObject();
    res.json({ id: String(out._id), ...out, _id: undefined });
  } catch (e) {
    next(e);
  }
});

// DELETE /workouts/:id  (owner-only; global not allowed)
router.delete("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const id = req.params.id;

  const deleted = await Workout.findOneAndDelete({ _id: id, userId });
  if (!deleted) {
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Workout not found or not yours" });
  }
  res.status(204).end();
});

export default router;

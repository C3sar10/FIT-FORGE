import { Router } from "express";
import { z } from "zod";
import Exercise from "../models/Exercise";
import { requireAuth } from "../middleware/requireAuth";
import { Types } from "mongoose";

const router = Router();
router.use(requireAuth);

// ---------- List query (unchanged) ----------
const ListQuery = z.object({
  scope: z.enum(["global", "mine", "all"]).default("global"),
  query: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional(), // last _id
});

router.get("/", async (req, res) => {
  const { scope, query, limit, cursor } = ListQuery.parse(req.query);
  const userId = (req as any).user.userId as string;

  const filter: any = {};
  if (scope === "global") filter.author = "global";
  if (scope === "mine") filter.author = userId;
  if (scope === "all") filter.author = { $in: ["global", userId] };
  if (query) filter.title = { $regex: query, $options: "i" };
  if (cursor) filter._id = { $gt: new Types.ObjectId(cursor) };

  const items = await Exercise.find(filter)
    .sort({ _id: 1 })
    .limit(limit + 1)
    .lean();

  const nextCursor =
    items.length > limit ? String((items as any)[limit]._id) : null;

  const payload = (items as any[]).slice(0, limit).map((d) => ({
    id: String(d._id),
    author: d.author,
    title: d.title,
    type: d.type,
    tags: d.tags ?? [],
    description: d.description ?? undefined,
    details: d.details ?? undefined,
    image: d.image ?? null,
    demoUrl: d.demoUrl ?? null,
  }));

  res.json({ items: payload, nextCursor });
});

// ---------- Get one exercise by id ----------
const IdParam = z.object({
  id: z
    .string()
    .refine((v) => Types.ObjectId.isValid(v), { message: "Invalid id" }),
});

router.get("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;

  // validate route param
  const { id } = IdParam.parse({ id: req.params.id });

  // only allow viewing your own exercises or global ones
  const doc = await Exercise.findOne({
    _id: new Types.ObjectId(id),
    author: { $in: ["global", userId] },
  })
    // optional: keep this in sync with fields you expose elsewhere
    // .select("author title type tags description details image demoUrl createdAt updatedAt")
    .lean();

  if (!doc) {
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Exercise not found" });
  }

  res.json({
    id: String(doc._id),
    author: doc.author,
    title: doc.title,
    type: doc.type,
    tags: doc.tags ?? [],
    description: doc.description ?? "",
    image: doc.image ?? null,
    demoUrl: doc.demoUrl ?? null,
    details: doc.details ?? undefined,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  });
});

// ---------- Create ONE user exercise ----------
const DetailsSchema = z.object({
  sets: z.number().int().min(1).max(20).optional(),
  repType: z
    .enum([
      "number",
      "duration",
      "distance",
      "time",
      "repRange",
      "timeRange",
      "other",
    ])
    .optional(),
  repNumber: z.number().int().min(1).max(999).optional(),
  repRange: z
    .object({
      min: z.number().int().min(1).max(999).optional(),
      max: z.number().int().min(1).max(999).optional(),
    })
    .optional(),
  timeRange: z
    .object({
      min: z
        .object({
          time: z.number().int().min(1).optional(),
          unit: z.string().max(10).optional(),
        })
        .optional(),
      max: z
        .object({
          time: z.number().int().min(1).optional(),
          unit: z.string().max(10).optional(),
        })
        .optional(),
    })
    .optional(),
  repDuration: z
    .object({
      time: z.number().int().min(1).optional(),
      unit: z.string().max(10).optional(),
    })
    .optional(),
  repDistance: z
    .object({
      distance: z.number().min(0).optional(),
      unit: z.string().max(10).optional(),
    })
    .optional(),
  restTimeSets: z
    .object({
      time: z.number().int().min(0).optional(),
      unit: z.string().max(10).optional(),
    })
    .optional(),
  restTimeReps: z
    .object({
      time: z.number().int().min(0).optional(),
      unit: z.string().max(10).optional(),
    })
    .optional(),
  targetMetric: z
    .object({
      type: z.string().max(50).optional(),
      unit: z.string().max(20).optional(),
      number: z.number().optional(),
      name: z.string().max(100).optional(),
    })
    .optional(),
  //durationSecs: z.number().int().min(1).max(36000).optional(),
  //restSecs: z.number().int().min(0).max(600).optional(),
  equipment: z.array(z.string().max(40)).max(20).optional(),
});

const CreateExerciseSchema = z.object({
  title: z.string().min(1).max(120),
  type: z
    .enum(["strength", "endurance", "sport", "speed", "other"])
    .default("strength"),
  tags: z.array(z.string().max(30)).max(20).optional(),
  description: z.string().max(1000).optional(),
  image: z.string().url().or(z.string().startsWith("/")).nullable().optional(),
  demoUrl: z.string().url().nullable().optional(),
  details: DetailsSchema.optional(),
});

router.post("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;
    const dto = CreateExerciseSchema.parse(req.body);

    // Uniqueness per author (same rule your index enforces)
    const exists = await Exercise.exists({ author: userId, title: dto.title });
    if (exists) {
      return res.status(409).json({
        error: "DUPLICATE",
        message: "You already have an exercise with this title.",
      });
    }

    const doc = await Exercise.create({
      author: userId,
      title: dto.title,
      type: dto.type,
      tags: dto.tags ?? [],
      description: dto.description ?? "",
      image: typeof dto.image === "undefined" ? null : dto.image,
      demoUrl: typeof dto.demoUrl === "undefined" ? null : dto.demoUrl,
      details: {
        sets: dto.details?.sets,
        repType: dto.details?.repType,
        repNumber: dto.details?.repNumber,
        repRange: dto.details?.repRange,
        timeRange: dto.details?.timeRange,
        repDuration: dto.details?.repDuration,
        repDistance: dto.details?.repDistance,
        restTimeSets: dto.details?.restTimeSets,
        restTimeReps: dto.details?.restTimeReps,
        targetMetric: dto.details?.targetMetric,
        equipment: dto.details?.equipment ?? [],
      },
    });

    const out = doc.toObject();
    res.status(201).json({
      id: String(out._id),
      author: out.author,
      title: out.title,
      type: out.type,
      tags: out.tags ?? [],
      description: out.description ?? "",
      image: out.image ?? null,
      demoUrl: out.demoUrl ?? null,
      details: out.details ?? undefined,
      createdAt: out.createdAt,
      updatedAt: out.updatedAt,
    });
  } catch (e) {
    next(e);
  }
});

// PATCH /exercises/:id
router.patch("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;
    const { id } = IdParam.parse({ id: req.params.id });

    // allow updating only your own exercise
    const doc = await Exercise.findOne({ _id: id, author: userId });
    if (!doc)
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Exercise not found" });

    // Basic shape guard (reuse your CreateExerciseSchema partial)
    const Partial = CreateExerciseSchema.partial();
    const dto = Partial.parse(req.body);

    // apply fields conditionally
    if (dto.title !== undefined) doc.title = dto.title;
    if (dto.type !== undefined) doc.type = dto.type;
    if (dto.description !== undefined) doc.description = dto.description ?? "";
    if (dto.tags !== undefined) doc.tags = dto.tags ?? [];
    if (dto.image !== undefined) doc.image = dto.image ?? "";
    if (dto.demoUrl !== undefined) doc.demoUrl = dto.demoUrl ?? null;
    if (dto.details !== undefined) {
      doc.details = {
        ...doc.details,
        sets: dto.details?.sets,
        repType: dto.details?.repType,
        repNumber: dto.details?.repNumber,
        repRange: dto.details?.repRange,
        timeRange: dto.details?.timeRange,
        repDuration: dto.details?.repDuration,
        repDistance: dto.details?.repDistance,
        restTimeSets: dto.details?.restTimeSets,
        restTimeReps: dto.details?.restTimeReps,
        targetMetric: dto.details?.targetMetric,
        //reps: dto.details?.reps,
        //durationSecs: dto.details?.durationSecs,
        //restSecs: dto.details?.restSecs,
        equipment: dto.details?.equipment ?? [],
      } as any;
    }

    await doc.save();
    const out = doc.toObject();
    res.json({
      id: String(out._id),
      author: out.author,
      title: out.title,
      type: out.type,
      tags: out.tags ?? [],
      description: out.description ?? "",
      image: out.image ?? null,
      demoUrl: out.demoUrl ?? null,
      details: out.details ?? undefined,
      createdAt: out.createdAt,
      updatedAt: out.updatedAt,
    });
  } catch (e) {
    next(e);
  }
});

// DELETE /exercises/:id
router.delete("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const { id } = IdParam.parse({ id: req.params.id });

  // Only delete if this user is the owner; global is never deleted here
  const deleted = await Exercise.findOneAndDelete({ _id: id, author: userId });
  if (!deleted) {
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Exercise not found or not yours" });
  }
  return res.status(204).end();
});

export default router;

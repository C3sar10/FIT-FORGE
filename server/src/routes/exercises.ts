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
  reps: z
    .union([
      z.number().int().min(1).max(999),
      z.string().regex(/^\d{1,3}-\d{1,3}$/),
    ])
    .optional(),
  durationSecs: z.number().int().min(1).max(36000).optional(),
  restSecs: z.number().int().min(0).max(600).optional(),
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
        reps: dto.details?.reps,
        durationSecs: dto.details?.durationSecs,
        restSecs: dto.details?.restSecs,
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

export default router;

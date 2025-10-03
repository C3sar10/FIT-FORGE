import { Router } from "express";
import { z } from "zod";
import Event from "../models/Events";
import { requireAuth } from "../middleware/requireAuth";
import { Types } from "mongoose";

const router = Router();
router.use(requireAuth);

// --- Schemas
const CreateSchema = z.object({
  title: z.string().min(1).max(80),
  type: z.enum(["workout", "log"]),
  date: z.coerce.date(),
  workoutDetails: z
    .object({
      workoutId: z.string().optional(),
      name: z.string().optional(),
      image: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  logDetails: z
    .object({
      logId: z.string().optional(),
      summary: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string().max(30)).max(12).optional(),
  description: z.string().max(500).optional(),
  completed: z.boolean().optional(),
});

const ListQuery = z.object({
  query: z.string().trim().max(80).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  cursor: z.string().optional(),
  scope: z.enum(["mine", "all"]).default("mine"),
});

// --- Create
router.post("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;
    // Log the incoming body first to aid debugging when parsing fails
    console.log("Create event incoming body:", req.body);
    const dto = CreateSchema.parse(req.body);
    console.log("Parsed dto:", dto);

    const doc = await Event.create({
      author: userId,
      ...dto,
    });

    const out = doc.toObject();
    res.status(201).json({
      id: String(out._id),
      ...out,
      _id: undefined,
    });
  } catch (e) {
    next(e);
  }
});

// --- List
router.get("/", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const { scope, query, limit, cursor } = ListQuery.parse(req.query);
  const { date, year, month } = req.query;

  const filter: any = {};
  if (scope === "mine") filter.author = userId;
  if (scope === "all") filter.$or = [{ author: userId }, { author: "global" }];
  if (query) filter.title = { $regex: query, $options: "i" };
  if (cursor) filter._id = { $lt: new Types.ObjectId(cursor) };

  // Filter by specific date (YYYY-MM-DD)
  if (typeof date === "string") {
    const day = new Date(date);
    if (!isNaN(day.getTime())) {
      const start = new Date(day);
      start.setHours(0, 0, 0, 0);
      const end = new Date(day);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }
  }

  // Filter by month (year and month provided)
  if (typeof year === "string" && typeof month === "string") {
    const y = parseInt(year);
    const m = parseInt(month) - 1; // JS months are 0-based
    if (!isNaN(y) && !isNaN(m)) {
      const start = new Date(y, m, 1, 0, 0, 0, 0);
      const end = new Date(y, m + 1, 0, 23, 59, 59, 999); // last day of month
      filter.date = { $gte: start, $lte: end };
    }
  }

  const docs = await Event.find(filter)
    .sort({ date: 1, _id: -1 })
    .limit(limit + 1)
    .lean();

  const nextCursor = docs.length > limit ? String(docs[limit]._id) : null;
  const items = (docs as any[]).slice(0, limit).map((d) => ({
    id: String(d._id),
    ...d,
    _id: undefined,
  }));
  res.json({ items, nextCursor });
});

// --- Get one
router.get("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const id = req.params.id;
  const doc = await Event.findOne({
    _id: id,
    $or: [{ author: userId }, { author: "global" }],
  }).lean();
  if (!doc)
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Event not found" });
  res.json({ id: String(doc._id), ...doc, _id: undefined });
});

// PATCH /events/:id (owner-only)
router.patch("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;
    const id = req.params.id;
    const existing = await Event.findOne({ _id: id, author: userId });
    if (!existing) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Event not found" });
    }
    const Partial = CreateSchema.partial();
    const dto = Partial.parse(req.body);
    Object.assign(existing, dto);
    await existing.save();
    const out = existing.toObject();
    res.json({ id: String(out._id), ...out, _id: undefined });
  } catch (e) {
    next(e);
  }
});

// DELETE /events/:id (owner-only)
router.delete("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const id = req.params.id;
  const deleted = await Event.findOneAndDelete({ _id: id, author: userId });
  if (!deleted) {
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Event not found or not yours" });
  }
  res.status(204).end();
});

export default router;

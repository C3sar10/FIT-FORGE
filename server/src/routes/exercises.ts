import { Router } from "express";
import { z } from "zod";
import Exercise from "../models/Exercise";
import { requireAuth } from "../middleware/requireAuth";
import { Types } from "mongoose";

const router = Router();
router.use(requireAuth);

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

  if (query) {
    // simple case-insensitive contains on title
    filter.title = { $regex: query, $options: "i" };
  }
  if (cursor) filter._id = { $gt: new Types.ObjectId(cursor) };

  const items = await Exercise.find(filter)
    //.select("author title type tags description details image") // narrow the shape
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
    image: d.image ?? null, // include for cards
  }));

  res.json({ items: payload, nextCursor });
});

export default router;

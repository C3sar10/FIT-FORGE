import { Router } from "express";
import { z } from "zod";
import WorkoutLog from "../models/WorkoutLog";
import { requireAuth } from "../middleware/requireAuth";
import { Types } from "mongoose";

const router = Router();
router.use(requireAuth);

// List logs (e.g., for user, with pagination/filter)
const ListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().optional(), // last _id for pagination
  fromDate: z.string().optional(),
  toDate: z.string().optional(),
});

router.get("/", async (req, res) => {
  const { limit, cursor, fromDate, toDate } = ListQuery.parse(req.query);
  const userId = (req as any).user.userId as string;

  const filter: any = { userId };
  if (fromDate) filter.createdOn = { $gte: new Date(fromDate) };
  if (toDate) filter.createdOn = { $lte: new Date(toDate) };
  if (cursor) filter._id = { $lt: new Types.ObjectId(cursor) }; // Descending for recent first

  const items = await WorkoutLog.find(filter)
    .sort({ createdOn: -1 }) // Recent first
    .limit(limit + 1)
    .lean();

  const nextCursor = items.length > limit ? String(items[limit]._id) : null;

  const payload = items.slice(0, limit).map((d: any) => ({
    logId: String(d._id),
    userId: String(d.userId),
    userName: d.userName,
    title: d.title,
    createdOn: d.createdOn.toISOString(),
    lastUpdated: d.lastUpdated.toISOString(),
    description: d.description,
    workoutDetails: d.workoutDetails,
    workoutDate: d.workoutDate,
    rating: d.rating,
    intensity: d.intensity,
    notes: d.notes,
  }));

  res.json({ items: payload, nextCursor });
});

// Get one log by ID
const IdParam = z.object({
  id: z
    .string()
    .refine((v) => Types.ObjectId.isValid(v), { message: "Invalid id" }),
});

router.get("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const { id } = IdParam.parse(req.params);

  const log = await WorkoutLog.findById(id).lean();
  if (!log || String(log.userId) !== userId) {
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Log not found or not yours" });
  }

  res.json({
    logId: String(log._id),
    userId: String(log.userId),
    userName: log.userName,
    title: log.title,
    createdOn: log.createdOn.toISOString(),
    lastUpdated: log.lastUpdated.toISOString(),
    description: log.description,
    workoutDetails: {
      ...log.workoutDetails,
      workoutTimestamp: log.workoutDetails?.workoutTimestamp.toISOString(),
      workoutId: String(log.workoutDetails?.workoutId),
    },
    rating: log.rating,
    intensity: log.intensity,
    notes: log.notes,
  });
});

// Create log
const CreateLogSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  workoutDetails: z.object({
    workoutTimestamp: z.string().datetime(),
    workoutTitle: z.string().min(1),
    workoutId: z.string(),
    duration: z.union([z.string(), z.number()]),
    exerciseList: z.array(
      z.object({
        /* Match structure */
      })
    ),
    exercisesCompleted: z.array(z.string()),
    type: z.string(),
  }),
  workoutDate: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  intensity: z.number().min(0).max(10).optional(),
  notes: z.string().optional(),
});

router.post("/", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const dto = CreateLogSchema.parse(req.body);

  const log = new WorkoutLog({
    userId,
    userName: (req as any).user.name || "User", // Adjust based on your user model
    title: dto.title,
    description: dto.description,
    workoutDetails: {
      ...dto.workoutDetails,
      workoutTimestamp: new Date(dto.workoutDetails.workoutTimestamp), // Convert string to Date
      workoutId: new Types.ObjectId(dto.workoutDetails.workoutId), // Ensure ObjectId
    },
    workoutDate: dto.workoutDate ? new Date(dto.workoutDate) : undefined,
    rating: dto.rating,
    intensity: dto.intensity,
    notes: dto.notes,
  });

  await log.save();

  const out = log.toObject();
  res.json({
    logId: String(out._id),
    userId: String(out.userId),
    userName: out.userName,
    title: out.title,
    createdOn: out.createdOn.toISOString(),
    lastUpdated: out.lastUpdated.toISOString(),
    description: out.description,
    workoutDetails: {
      ...out.workoutDetails,
      workoutTimestamp: out.workoutDetails?.workoutTimestamp.toISOString(), // Back to string for client
      workoutId: String(out.workoutDetails?.workoutId),
    },
    rating: out.rating,
    intensity: out.intensity,
    notes: out.notes,
  });
});

// Update log (PATCH for partial updates)
const UpdateLogSchema = CreateLogSchema.partial();

router.patch("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const { id } = IdParam.parse(req.params);
  const dto = UpdateLogSchema.parse(req.body);

  const log = await WorkoutLog.findById(id);
  if (!log || String(log.userId) !== userId) {
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Log not found or not yours" });
  }

  // Apply partial updates
  if (dto.title) log.title = dto.title;
  if (dto.description !== undefined) log.description = dto.description;
  if (dto.workoutDetails) {
    const existingDetails = log.workoutDetails;
    const newDetails = {
      ...existingDetails,
      ...dto.workoutDetails,
      ...(dto.workoutDetails.workoutTimestamp && {
        workoutTimestamp: new Date(dto.workoutDetails.workoutTimestamp), // Convert string to Date
      }),
      ...(dto.workoutDetails.workoutId && {
        workoutId: new Types.ObjectId(dto.workoutDetails.workoutId), // Convert to ObjectId
      }),
    } as any; // Type assertion to bypass TS inference issue
    log.workoutDetails = newDetails;
  }
  if (dto.rating !== undefined) log.rating = dto.rating;
  if (dto.intensity !== undefined) log.intensity = dto.intensity;
  if (dto.notes !== undefined) log.notes = dto.notes;

  log.lastUpdated = new Date(); // Explicitly update timestamp
  await log.save();

  const out = log.toObject();
  res.json({
    logId: String(out._id),
    userId: String(out.userId),
    userName: out.userName,
    title: out.title,
    createdOn: out.createdOn.toISOString(),
    lastUpdated: out.lastUpdated.toISOString(),
    description: out.description,
    workoutDetails: {
      ...out.workoutDetails,
      workoutTimestamp: out.workoutDetails?.workoutTimestamp.toISOString(),
      workoutId: String(out.workoutDetails?.workoutId),
    },
    rating: out.rating,
    intensity: out.intensity,
    notes: out.notes,
  });
});

// Delete log
router.delete("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const { id } = IdParam.parse(req.params);

  const deleted = await WorkoutLog.findOneAndDelete({ _id: id, userId });
  if (!deleted) {
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Log not found or not yours" });
  }
  res.status(204).end();
});

export default router;

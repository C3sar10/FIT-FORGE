import { Router } from "express";
import { z } from "zod";
import MetricLog from "../models/MetricLog";
import User from "../models/User";
import { requireAuth } from "../middleware/requireAuth";
import { Types } from "mongoose";

const router = Router();
router.use(requireAuth);

// --- Schemas
const CreateMetricLogSchema = z.object({
  date: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  metrics: z.object({
    weight: z
      .object({
        value: z.number().min(0.1).max(1000),
        unit: z.enum(["kg", "lbs"]),
      })
      .optional(),
    bodyFat: z
      .object({
        value: z.number().min(0).max(100),
      })
      .optional(),
    height: z
      .object({
        value: z.number().min(0.1).max(300),
        unit: z.enum(["cm", "ft", "in"]),
      })
      .optional(),
  }),
  notes: z.string().max(500).optional(),
});

const ListQuery = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(30),
  cursor: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

// --- Create metric log
router.post("/", async (req, res, next) => {
  try {
    console.log(
      "POST /metric-logs - Request body:",
      JSON.stringify(req.body, null, 2)
    );

    const userId = (req as any).user.userId as string;

    // Fetch user name from database
    const user = await User.findById(userId);
    const userName = user?.name || "Unknown User";

    console.log("User info - userId:", userId, "userName:", userName);

    const dto = CreateMetricLogSchema.parse(req.body);
    console.log("Parsed DTO:", JSON.stringify(dto, null, 2));

    const doc = await MetricLog.create({
      userId,
      userName,
      date: new Date(dto.date),
      metrics: dto.metrics,
      notes: dto.notes,
    });

    console.log("Created document:", JSON.stringify(doc.toObject(), null, 2));

    const out = doc.toObject();
    console.log("Returning response:", {
      logId: String(out._id),
      userId: out.userId,
      userName: out.userName,
      date: out.date.toISOString(),
      createdAt: out.createdAt.toISOString(),
      lastUpdated: out.lastUpdated.toISOString(),
      metrics: out.metrics,
      notes: out.notes,
    });

    res.status(201).json({
      logId: String(out._id),
      userId: out.userId,
      userName: out.userName,
      date: out.date.toISOString(),
      createdAt: out.createdAt.toISOString(),
      lastUpdated: out.lastUpdated.toISOString(),
      metrics: out.metrics,
      notes: out.notes,
    });
  } catch (e) {
    console.error("Error in POST /metric-logs:", e);
    next(e);
  }
});

// --- List metric logs
router.get("/", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const { limit, cursor, startDate, endDate } = ListQuery.parse(req.query);

  const filter: any = { userId };

  // Date range filtering
  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  if (cursor) filter._id = { $lt: new Types.ObjectId(cursor) };

  const docs = await MetricLog.find(filter)
    .sort({ date: -1, _id: -1 })
    .limit(limit + 1)
    .lean();

  const nextCursor = docs.length > limit ? String(docs[limit]._id) : null;
  const items = docs.slice(0, limit).map((d) => ({
    logId: String(d._id),
    userId: d.userId,
    userName: d.userName,
    date: d.date.toISOString(),
    createdAt: d.createdAt.toISOString(),
    lastUpdated: d.lastUpdated.toISOString(),
    metrics: d.metrics,
    notes: d.notes,
  }));

  res.json({ items, pagination: { nextCursor } });
});

// --- Get summary/stats (must be before /:id route)
router.get("/summary", async (req, res) => {
  const userId = (req as any).user.userId as string;

  // Get latest metrics
  const latestLogs = await MetricLog.find({ userId })
    .sort({ date: -1 })
    .limit(10)
    .lean();

  const summary = {
    latestWeight: null as { value: number; unit: string } | null,
    latestBodyFat: null as number | null,
    latestHeight: null as { value: number; unit: string } | null,
    latestBMI: null as { bmi: number; category: string } | null,
    totalLogs: await MetricLog.countDocuments({ userId }),
  };

  // Find latest values
  for (const log of latestLogs) {
    if (!summary.latestWeight && log.metrics.weight) {
      summary.latestWeight = {
        value: log.metrics.weight.value,
        unit: log.metrics.weight.unit,
      };
    }
    if (!summary.latestBodyFat && log.metrics.bodyFat) {
      summary.latestBodyFat = log.metrics.bodyFat.value;
    }
    if (!summary.latestHeight && log.metrics.height) {
      summary.latestHeight = log.metrics.height;
    }
  }

  // Calculate BMI if we have both weight and height
  if (summary.latestWeight && summary.latestHeight) {
    let weightInKg = summary.latestWeight.value;
    let heightInM = summary.latestHeight.value;

    // Convert to metric if needed
    if (summary.latestHeight.unit === "ft") {
      heightInM = heightInM * 0.3048;
    } else if (summary.latestHeight.unit === "in") {
      heightInM = heightInM * 0.0254;
    } else if (summary.latestHeight.unit === "cm") {
      heightInM = heightInM / 100;
    }

    // Convert weight to kg if needed
    if (summary.latestWeight.unit === "lbs") {
      weightInKg = weightInKg * 0.453592;
    }

    const bmi = weightInKg / (heightInM * heightInM);
    let category = "Normal weight";
    if (bmi < 18.5) category = "Underweight";
    else if (bmi >= 25 && bmi < 30) category = "Overweight";
    else if (bmi >= 30) category = "Obesity";

    summary.latestBMI = { bmi: Math.round(bmi * 10) / 10, category };
  }

  res.json(summary);
});

// --- Get one metric log
router.get("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const id = req.params.id;

  const doc = await MetricLog.findOne({ _id: id, userId }).lean();

  if (!doc)
    return res
      .status(404)
      .json({ error: "NOT_FOUND", message: "Metric log not found" });

  res.json({
    logId: String(doc._id),
    userId: doc.userId,
    userName: doc.userName,
    date: doc.date.toISOString(),
    createdAt: doc.createdAt.toISOString(),
    lastUpdated: doc.lastUpdated.toISOString(),
    metrics: doc.metrics,
    notes: doc.notes,
  });
});

// --- Update metric log
router.patch("/:id", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;
    const id = req.params.id;

    const existing = await MetricLog.findOne({ _id: id, userId });
    if (!existing) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "Metric log not found" });
    }

    const Partial = CreateMetricLogSchema.partial();
    const dto = Partial.parse(req.body);

    if (dto.date !== undefined) existing.date = new Date(dto.date);
    if (dto.metrics !== undefined)
      existing.metrics = { ...existing.metrics, ...dto.metrics };
    if (dto.notes !== undefined) existing.notes = dto.notes;
    existing.lastUpdated = new Date();

    await existing.save();

    const out = existing.toObject();
    res.json({
      logId: String(out._id),
      userId: out.userId,
      userName: out.userName,
      date: out.date.toISOString(),
      createdAt: out.createdAt.toISOString(),
      lastUpdated: out.lastUpdated.toISOString(),
      metrics: out.metrics,
      notes: out.notes,
    });
  } catch (e) {
    next(e);
  }
});

// --- Delete metric log
router.delete("/:id", async (req, res) => {
  const userId = (req as any).user.userId as string;
  const id = req.params.id;

  const deleted = await MetricLog.findOneAndDelete({ _id: id, userId });
  if (!deleted) {
    return res.status(404).json({
      error: "NOT_FOUND",
      message: "Metric log not found or not yours",
    });
  }
  res.status(204).end();
});

export default router;

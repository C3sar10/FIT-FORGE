// src/routes/Plan.ts
import { Router } from "express";
import { z } from "zod";
import Plan from "../models/Plans";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();
router.use(requireAuth);

const CreatePlanSchema = z.object({
  title: z.string().min(1).max(100),
  type: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  deadline: z.coerce.date().optional(),   // accepts strings like "2025-10-01"
  priority: z.enum(["low", "medium", "high"]).default("medium"),
  tags: z.array(z.string().max(30)).max(12).optional(),
});

// Get one plan
router.get("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;

    const plan = await Plan.findOne({ userId }).lean();

    if (!plan) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "No active plan found." });
    }

    res.json({
      // id: String(plan._id),
      // title: plan.title,
      // type: plan.type,
      // description: plan.description ?? "",
      // deadline: plan.deadline ?? null,
      // priority: plan.priority,
      // tags: plan.tags ?? [],
      // createdAt: plan.createdAt,
      // updatedAt: plan.updatedAt,
      plan
    });
  } catch (err) {
    next(err);
  }
});

// Create a new plan
router.post("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;
    const dto = CreatePlanSchema.parse(req.body);

    const plan = await Plan.create({ 
        userId, 
        ...dto 
    });
    res.status(201).json({
        id: String(plan._id),
        title: plan.title,
        type: plan.type,
        description: plan.description ?? "",
        deadline: plan.deadline ?? null,
        priority: plan.priority,
        tags: plan.tags ?? [],
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
    });
  } catch (err) {
    next(err);
  }
});

router.delete("/", async (req, res, next) => {
  try {
    const userId = (req as any).user.userId as string;

    const deletedPlan = await Plan.findOneAndDelete({ userId });

    if (!deletedPlan) {
      return res
        .status(404)
        .json({ error: "NOT_FOUND", message: "No active plan to delete." });
    }

    res.json({ 
      message: "Plan deleted successfully.", 
      deletedPlan: {
        id: String(deletedPlan._id),
        title: deletedPlan.title,
        type: deletedPlan.type,
      }
    });
  } catch (err) {
    next(err);
  }
});

export default router;
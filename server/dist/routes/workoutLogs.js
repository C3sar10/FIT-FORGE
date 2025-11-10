"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const zod_1 = require("zod");
const WorkoutLog_1 = __importDefault(require("../models/WorkoutLog"));
const requireAuth_1 = require("../middleware/requireAuth");
const mongoose_1 = require("mongoose");
const router = (0, express_1.Router)();
router.use(requireAuth_1.requireAuth);
// List logs (e.g., for user, with pagination/filter)
const ListQuery = zod_1.z.object({
    limit: zod_1.z.coerce.number().int().min(1).max(100).default(50),
    cursor: zod_1.z.string().optional(), // last _id for pagination
    fromDate: zod_1.z.string().optional(),
    toDate: zod_1.z.string().optional(),
});
router.get("/", async (req, res) => {
    const { limit, cursor, fromDate, toDate } = ListQuery.parse(req.query);
    const userId = req.user.userId;
    const filter = { userId };
    if (fromDate)
        filter.createdOn = { $gte: new Date(fromDate) };
    if (toDate)
        filter.createdOn = { $lte: new Date(toDate) };
    if (cursor)
        filter._id = { $lt: new mongoose_1.Types.ObjectId(cursor) }; // Descending for recent first
    const items = await WorkoutLog_1.default.find(filter)
        .sort({ createdOn: -1 }) // Recent first
        .limit(limit + 1)
        .lean();
    const nextCursor = items.length > limit ? String(items[limit]._id) : null;
    const payload = items.slice(0, limit).map((d) => ({
        logId: String(d._id),
        userId: String(d.userId),
        userName: d.userName,
        title: d.title,
        createdOn: d.createdOn.toISOString(),
        lastUpdated: d.lastUpdated.toISOString(),
        description: d.description,
        workoutDetails: {
            ...d.workoutDetails,
            workoutTimestamp: d.workoutDetails?.workoutTimestamp?.toISOString(),
            workoutId: d.workoutDetails?.workoutId ? String(d.workoutDetails.workoutId) : null,
            exerciseList: d.workoutDetails?.exerciseList?.map((exercise) => ({
                ...exercise,
                exerciseId: String(exercise.exerciseId),
                startTime: exercise.startTime ? exercise.startTime.toISOString() : undefined,
                endTime: exercise.endTime ? exercise.endTime.toISOString() : undefined,
            })) || [],
        },
        workoutDate: d.workoutDate?.toISOString(),
        rating: d.rating,
        intensity: d.intensity,
        notes: d.notes,
        schemaVersion: d.schemaVersion,
    }));
    res.json({ items: payload, nextCursor });
});
// Get one log by ID
const IdParam = zod_1.z.object({
    id: zod_1.z
        .string()
        .refine((v) => mongoose_1.Types.ObjectId.isValid(v), { message: "Invalid id" }),
});
router.get("/:id", async (req, res) => {
    const userId = req.user.userId;
    const { id } = IdParam.parse(req.params);
    const log = await WorkoutLog_1.default.findById(id).lean();
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
        workoutDate: log.workoutDate ? log.workoutDate.toISOString() : null,
        workoutDetails: {
            workoutTimestamp: log.workoutDetails?.workoutTimestamp.toISOString(),
            workoutTitle: log.workoutDetails?.workoutTitle,
            workoutId: log.workoutDetails?.workoutId
                ? String(log.workoutDetails.workoutId)
                : null,
            duration: log.workoutDetails?.duration,
            exerciseList: log.workoutDetails?.exerciseList?.map((exercise) => ({
                ...exercise,
                exerciseId: String(exercise.exerciseId),
                startTime: exercise.startTime ? exercise.startTime.toISOString() : undefined,
                endTime: exercise.endTime ? exercise.endTime.toISOString() : undefined,
            })) || [],
            exercisesCompleted: log.workoutDetails?.exercisesCompleted || [],
            type: log.workoutDetails?.type,
        },
        rating: log.rating,
        intensity: log.intensity,
        notes: log.notes,
        schemaVersion: log.schemaVersion,
    });
});
// Zod schema for set performance
const SetPerformanceSchema = zod_1.z.object({
    setNumber: zod_1.z.number().int().min(1),
    reps: zod_1.z.number().int().min(0),
    weight: zod_1.z.number().optional(),
    restTime: zod_1.z.number().optional(),
    completed: zod_1.z.boolean().default(false),
    notes: zod_1.z.string().optional(),
});
// Zod schema for exercise log entry
const ExerciseLogEntrySchema = zod_1.z.object({
    exerciseId: zod_1.z.string(),
    name: zod_1.z.string(),
    plannedSets: zod_1.z.number().int().min(0),
    plannedReps: zod_1.z.union([zod_1.z.number(), zod_1.z.string()]),
    plannedRestSecs: zod_1.z.number().optional(),
    actualSets: zod_1.z.array(SetPerformanceSchema).default([]),
    completed: zod_1.z.boolean().default(false),
    notes: zod_1.z.string().optional(),
    startTime: zod_1.z.string().optional(),
    endTime: zod_1.z.string().optional(),
});
// Create log
const CreateLogSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional(),
    workoutDetails: zod_1.z.object({
        workoutTimestamp: zod_1.z.string().datetime(),
        workoutTitle: zod_1.z.string().min(1),
        workoutId: zod_1.z.string().nullable(),
        duration: zod_1.z.union([zod_1.z.string(), zod_1.z.number()]),
        exerciseList: zod_1.z.array(ExerciseLogEntrySchema),
        exercisesCompleted: zod_1.z.array(zod_1.z.string()),
        type: zod_1.z.string(),
    }),
    workoutDate: zod_1.z.string().optional(),
    rating: zod_1.z.number().min(0).max(5).optional(),
    intensity: zod_1.z.number().min(0).max(10).optional(),
    notes: zod_1.z.string().optional(),
});
router.post("/", async (req, res) => {
    const userId = req.user.userId;
    const dto = CreateLogSchema.parse(req.body);
    // Convert exerciseList to proper ObjectIds and structure
    const exerciseList = dto.workoutDetails.exerciseList.map((exercise) => ({
        ...exercise,
        exerciseId: new mongoose_1.Types.ObjectId(exercise.exerciseId),
        startTime: exercise.startTime ? new Date(exercise.startTime) : undefined,
        endTime: exercise.endTime ? new Date(exercise.endTime) : undefined,
    }));
    const log = new WorkoutLog_1.default({
        userId,
        userName: req.user.name || "User", // Adjust based on your user model
        title: dto.title,
        description: dto.description,
        workoutDetails: {
            workoutTimestamp: new Date(dto.workoutDetails.workoutTimestamp),
            workoutTitle: dto.workoutDetails.workoutTitle,
            workoutId: dto.workoutDetails?.workoutId
                ? new mongoose_1.Types.ObjectId(dto.workoutDetails.workoutId)
                : null,
            duration: dto.workoutDetails.duration,
            exerciseList: exerciseList,
            exercisesCompleted: dto.workoutDetails.exercisesCompleted,
            type: dto.workoutDetails.type,
        },
        workoutDate: dto.workoutDate ? new Date(dto.workoutDate) : undefined,
        rating: dto.rating,
        intensity: dto.intensity,
        notes: dto.notes,
        schemaVersion: 2, // Set as v2 for new logs
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
            workoutTimestamp: out.workoutDetails?.workoutTimestamp.toISOString(),
            workoutId: out.workoutDetails?.workoutId
                ? String(out.workoutDetails.workoutId)
                : null,
            exerciseList: out.workoutDetails?.exerciseList?.map((exercise) => ({
                ...exercise,
                exerciseId: String(exercise.exerciseId),
                startTime: exercise.startTime ? exercise.startTime.toISOString() : undefined,
                endTime: exercise.endTime ? exercise.endTime.toISOString() : undefined,
            })) || [],
        },
        rating: out.rating,
        intensity: out.intensity,
        notes: out.notes,
        schemaVersion: out.schemaVersion,
    });
});
// Update log (PATCH for partial updates)
const UpdateLogSchema = CreateLogSchema.partial();
router.patch("/:id", async (req, res) => {
    const userId = req.user.userId;
    const { id } = IdParam.parse(req.params);
    const dto = UpdateLogSchema.parse(req.body);
    const log = await WorkoutLog_1.default.findById(id);
    if (!log || String(log.userId) !== userId) {
        return res
            .status(404)
            .json({ error: "NOT_FOUND", message: "Log not found or not yours" });
    }
    // Apply partial updates
    if (dto.title)
        log.title = dto.title;
    if (dto.description !== undefined)
        log.description = dto.description;
    if (dto.workoutDate !== undefined) {
        log.workoutDate = dto.workoutDate ? new Date(dto.workoutDate) : undefined;
    }
    if (dto.workoutDetails) {
        const existingDetails = log.workoutDetails;
        const newDetails = {
            ...existingDetails,
            ...dto.workoutDetails,
            ...(dto.workoutDetails.workoutTimestamp && {
                workoutTimestamp: new Date(dto.workoutDetails.workoutTimestamp),
            }),
            ...(dto.workoutDetails.workoutId !== undefined && {
                workoutId: dto.workoutDetails.workoutId
                    ? new mongoose_1.Types.ObjectId(dto.workoutDetails.workoutId)
                    : null,
            }),
            ...(dto.workoutDetails.exerciseList && {
                exerciseList: dto.workoutDetails.exerciseList.map((exercise) => ({
                    ...exercise,
                    exerciseId: new mongoose_1.Types.ObjectId(exercise.exerciseId),
                    startTime: exercise.startTime ? new Date(exercise.startTime) : undefined,
                    endTime: exercise.endTime ? new Date(exercise.endTime) : undefined,
                })),
            }),
        };
        log.workoutDetails = newDetails;
    }
    if (dto.rating !== undefined)
        log.rating = dto.rating;
    if (dto.intensity !== undefined)
        log.intensity = dto.intensity;
    if (dto.notes !== undefined)
        log.notes = dto.notes;
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
        workoutDate: out.workoutDate ? out.workoutDate.toISOString() : null,
        workoutDetails: {
            ...out.workoutDetails,
            workoutTimestamp: out.workoutDetails?.workoutTimestamp.toISOString(),
            workoutId: out.workoutDetails?.workoutId
                ? String(out.workoutDetails.workoutId)
                : null,
            exerciseList: out.workoutDetails?.exerciseList?.map((exercise) => ({
                ...exercise,
                exerciseId: String(exercise.exerciseId),
                startTime: exercise.startTime ? exercise.startTime.toISOString() : undefined,
                endTime: exercise.endTime ? exercise.endTime.toISOString() : undefined,
            })) || [],
        },
        rating: out.rating,
        intensity: out.intensity,
        notes: out.notes,
        schemaVersion: out.schemaVersion,
    });
});
// Delete log
router.delete("/:id", async (req, res) => {
    const userId = req.user.userId;
    const { id } = IdParam.parse(req.params);
    const deleted = await WorkoutLog_1.default.findOneAndDelete({ _id: id, userId });
    if (!deleted) {
        return res
            .status(404)
            .json({ error: "NOT_FOUND", message: "Log not found or not yours" });
    }
    res.status(204).end();
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/verify-workouts-v2.ts
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
(async () => {
    await mongoose_1.default.connect(process.env.MONGODB_URI || "");
    const workouts = mongoose_1.default.connection.db.collection("workouts");
    const total = await workouts.countDocuments();
    const remaining = await workouts.countDocuments({
        $or: [
            { schemaVersion: { $exists: false } },
            { schemaVersion: { $lt: 2 } },
            { "blocks.items.repObj": { $exists: false } },
            { "blocks.items.repObj.repType": { $exists: false } },
            { "blocks.items.repObj.repNumber": { $exists: false } },
            { "blocks.items.repObj.repRange": { $exists: false } },
            { "blocks.items.repObj.timeRange": { $exists: false } },
            { "blocks.items.repObj.repDuration": { $exists: false } },
            { "blocks.items.repObj.repDistance": { $exists: false } },
            { "blocks.items.repObj.restTimeSets": { $exists: false } },
            { "blocks.items.repObj.restTimeReps": { $exists: false } },
            { "blocks.items.repObj.targetMetric": { $exists: false } },
            { "blocks.items.repObj.equipment": { $exists: false } },
        ],
    });
    console.log({
        total,
        remaining,
        migrated: total != null && remaining != null ? total - remaining : 0,
    });
    // Optional: quick type sanity stats for v2 docs
    const shapeReport = await workouts
        .aggregate([
        { $match: { schemaVersion: 2 } },
        { $unwind: { path: "$blocks", preserveNullAndEmptyArrays: true } },
        { $unwind: { path: "$blocks.items", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 0,
                repTypeType: { $type: "$blocks.items.repObj.repType" },
                repNumberType: { $type: "$blocks.items.repObj.repNumber" },
                repRangeType: { $type: "$blocks.items.repObj.repRange" },
                timeRangeType: { $type: "$blocks.items.repObj.timeRange" },
                repDurationType: { $type: "$blocks.items.repObj.repDuration" },
                repDistanceType: { $type: "$blocks.items.repObj.repDistance" },
                restTimeSetsType: { $type: "$blocks.items.repObj.restTimeSets" },
                restTimeRepsType: { $type: "$blocks.items.repObj.restTimeReps" },
                targetMetricType: { $type: "$blocks.items.repObj.targetMetric" },
                equipmentType: { $type: "$blocks.items.repObj.equipment" },
            },
        },
        {
            $group: {
                _id: null,
                repTypeTypes: { $addToSet: "$repTypeType" },
                repNumberTypes: { $addToSet: "$repNumberType" },
                repRangeTypes: { $addToSet: "$repRangeType" },
                timeRangeTypes: { $addToSet: "$timeRangeType" },
                repDurationTypes: { $addToSet: "$repDurationType" },
                repDistanceTypes: { $addToSet: "$repDistanceType" },
                restTimeSetsTypes: { $addToSet: "$restTimeSetsType" },
                restTimeRepsTypes: { $addToSet: "$restTimeRepsType" },
                targetMetricTypes: { $addToSet: "$targetMetricType" },
                equipmentTypes: { $addToSet: "$equipmentType" },
            },
        },
    ])
        .toArray();
    console.log("Shape report (types seen among v2 docs):", shapeReport[0]);
    // Spot check 10 docs for the fields you care about
    const sample = await workouts
        .aggregate([
        { $match: { schemaVersion: 2 } },
        { $sample: { size: 10 } },
        {
            $project: {
                name: 1,
                author: 1,
                type: 1,
                tags: 1,
                blocks: {
                    $map: {
                        input: "$blocks",
                        as: "block",
                        in: {
                            title: "$$block.title",
                            items: {
                                $map: {
                                    input: "$$block.items",
                                    as: "item",
                                    in: {
                                        name: "$$item.name",
                                        sets: "$$item.sets",
                                        reps: "$$item.reps",
                                        restSecs: "$$item.restSecs",
                                        repObjRepType: "$$item.repObj.repType",
                                        repObjRepNumber: "$$item.repObj.repNumber",
                                        repObjRepRange: "$$item.repObj.repRange",
                                        repObjTargetMetric: "$$item.repObj.targetMetric",
                                        repObjEquipment: "$$item.repObj.equipment",
                                    },
                                },
                            },
                        },
                    },
                },
                schemaVersion: 1,
                updatedAt: 1,
            },
        },
    ])
        .toArray();
    console.log("Sample v2 docs:", sample.length);
    // If you want to actually see one:
    // console.dir(sample[0], { depth: null });
    await mongoose_1.default.disconnect();
})();

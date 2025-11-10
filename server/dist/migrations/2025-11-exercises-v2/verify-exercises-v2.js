"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/verify-exercises-v2.ts
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
(async () => {
    await mongoose_1.default.connect(process.env.MONGODB_URI || "");
    const exercises = mongoose_1.default.connection.db.collection("exercises");
    const total = await exercises.countDocuments();
    const remaining = await exercises.countDocuments({
        $or: [
            { schemaVersion: { $exists: false } },
            { schemaVersion: { $lt: 2 } },
            { details: { $exists: false } },
            { "details.repType": { $exists: false } },
            { "details.repNumber": { $exists: false } },
            { "details.repRange": { $exists: false } },
            { "details.timeRange": { $exists: false } },
            { "details.repDuration": { $exists: false } },
            { "details.repDistance": { $exists: false } },
            { "details.restTimeSets": { $exists: false } },
            { "details.restTimeReps": { $exists: false } },
            { "details.targetMetric": { $exists: false } },
            { "details.equipment": { $exists: false } },
        ],
    });
    console.log({
        total,
        remaining,
        migrated: total != null && remaining != null ? total - remaining : 0,
    });
    // Optional: quick type sanity stats for v2 docs
    const shapeReport = await exercises
        .aggregate([
        { $match: { schemaVersion: 2 } },
        {
            $project: {
                _id: 0,
                repTypeType: { $type: "$details.repType" },
                repNumberType: { $type: "$details.repNumber" },
                repRangeType: { $type: "$details.repRange" },
                timeRangeType: { $type: "$details.timeRange" },
                repDurationType: { $type: "$details.repDuration" },
                repDistanceType: { $type: "$details.repDistance" },
                restTimeSetsType: { $type: "$details.restTimeSets" },
                restTimeRepsType: { $type: "$details.restTimeReps" },
                targetMetricType: { $type: "$details.targetMetric" },
                equipmentType: { $type: "$details.equipment" },
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
    // Spot check 20 docs for the fields you care about
    const sample = await exercises
        .aggregate([
        { $match: { schemaVersion: 2 } },
        { $sample: { size: 20 } },
        {
            $project: {
                title: 1,
                author: 1,
                type: 1,
                tags: 1,
                "details.repType": 1,
                "details.repNumber": 1,
                "details.repRange": 1,
                "details.timeRange": 1,
                "details.repDuration": 1,
                "details.repDistance": 1,
                "details.restTimeSets": 1,
                "details.restTimeReps": 1,
                "details.targetMetric": 1,
                "details.equipment": 1,
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

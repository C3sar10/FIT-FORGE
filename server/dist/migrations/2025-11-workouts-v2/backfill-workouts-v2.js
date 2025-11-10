"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// scripts/migrate-workouts-v2.ts
require("dotenv/config");
const mongoose_1 = __importDefault(require("mongoose"));
const BATCH = 1000;
const MIGRATION_KEY = "workouts-v2";
function isNil(v) {
    return v === undefined || v === null;
}
function v2PatchForWorkoutItem(item) {
    const patch = { ...item };
    const repObj = item.repObj || {};
    // Initialize repObj if it doesn't exist
    patch.repObj = { ...repObj };
    if (isNil(repObj.repType))
        patch.repObj.repType = "number";
    if (isNil(repObj.repNumber))
        patch.repObj.repNumber = null;
    if (isNil(repObj.repRange))
        patch.repObj.repRange = { min: null, max: null };
    if (isNil(repObj.timeRange))
        patch.repObj.timeRange = {
            min: { time: null, unit: null },
            max: { time: null, unit: null },
        };
    if (isNil(repObj.repDuration))
        patch.repObj.repDuration = { time: null, unit: null };
    if (isNil(repObj.repDistance))
        patch.repObj.repDistance = { distance: null, unit: null };
    if (isNil(repObj.restTimeSets))
        patch.repObj.restTimeSets = { time: null, unit: null };
    if (isNil(repObj.restTimeReps))
        patch.repObj.restTimeReps = { time: null, unit: null };
    if (isNil(repObj.targetMetric))
        patch.repObj.targetMetric = {
            type: null,
            unit: null,
            number: null,
            name: null,
        };
    if (isNil(repObj.equipment))
        patch.repObj.equipment = [];
    return patch;
}
function v2PatchForWorkout(doc) {
    const patch = { schemaVersion: 2, updatedAt: new Date() };
    // Process blocks and their items
    if (doc.blocks && Array.isArray(doc.blocks)) {
        patch.blocks = doc.blocks.map((block) => ({
            ...block,
            items: block.items ? block.items.map(v2PatchForWorkoutItem) : [],
        }));
    }
    return patch;
}
(async () => {
    await mongoose_1.default.connect(process.env.MONGODB_URI || "");
    const db = mongoose_1.default.connection.db;
    const workouts = db.collection("workouts");
    const checkpoints = db.collection("migration_checkpoints");
    const cp = await checkpoints.findOne({ key: MIGRATION_KEY });
    const lastId = cp?.lastId;
    // Only pick docs that are < v2 OR missing repObj fields in items.
    const needsV2OrBackfill = {
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
    };
    const predicate = {
        ...needsV2OrBackfill,
        ...(lastId ? { _id: { $gt: lastId } } : {}),
    };
    let migrated = 0;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const batch = await workouts
            .find(predicate, {
            sort: { _id: 1 },
            projection: {
                _id: 1,
                schemaVersion: 1,
                blocks: 1, // pull blocks wholesale
            },
        })
            .limit(BATCH)
            .toArray();
        if (!batch.length)
            break;
        const ops = batch.map((doc) => ({
            updateOne: {
                filter: {
                    _id: doc._id,
                    ...needsV2OrBackfill, // ensure we still need to touch it
                },
                update: { $set: v2PatchForWorkout(doc) },
            },
        }));
        if (ops.length)
            await workouts.bulkWrite(ops, { ordered: false });
        migrated += batch.length;
        const newLastId = batch[batch.length - 1]._id;
        await checkpoints.updateOne({ key: MIGRATION_KEY }, { $set: { lastId: newLastId } }, { upsert: true });
        // tiny breather for the cluster
        await new Promise((r) => setTimeout(r, 50));
    }
    console.log(`Backfill complete. Migrated or confirmed ~${migrated} docs.`);
    await mongoose_1.default.disconnect();
})();

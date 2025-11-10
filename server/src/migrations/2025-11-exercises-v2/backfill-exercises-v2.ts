// scripts/migrate-exercises-v2.ts
import "dotenv/config";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const BATCH = 1000;
const MIGRATION_KEY = "exercises-v2";
type CheckpointDoc = { _id: ObjectId; key: string; lastId?: ObjectId };

function isNil(v: any) {
  return v === undefined || v === null;
}

function v2PatchFor(doc: any) {
  const patch: any = { schemaVersion: 2, updatedAt: new Date() };
  const d = doc.details || {};

  // start with current details (if any)
  patch.details = { ...d };

  if (isNil(d.repType)) patch.details.repType = "number";
  if (isNil(d.repNumber)) patch.details.repNumber = 0;

  if (isNil(d.repRange)) patch.details.repRange = { min: null, max: null };

  if (isNil(d.timeRange))
    patch.details.timeRange = {
      min: { time: null, unit: null },
      max: { time: null, unit: null },
    };

  if (isNil(d.repDuration))
    patch.details.repDuration = { time: null, unit: null };

  if (isNil(d.repDistance))
    patch.details.repDistance = { distance: null, unit: null };

  if (isNil(d.restTimeSets))
    patch.details.restTimeSets = { time: null, unit: null };

  if (isNil(d.restTimeReps))
    patch.details.restTimeReps = { time: null, unit: null };

  if (isNil(d.targetMetric))
    patch.details.targetMetric = {
      type: null,
      unit: null,
      number: null,
      name: null,
    };

  if (isNil(d.equipment)) patch.details.equipment = [];

  return patch;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const db = mongoose.connection.db!;
  const exercises = db.collection("exercises");
  const checkpoints = db.collection<CheckpointDoc>("migration_checkpoints");

  const cp = await checkpoints.findOne({ key: MIGRATION_KEY });
  const lastId = cp?.lastId;

  // Only pick docs that are < v2 OR missing details.* fields.
  const needsV2OrBackfill = {
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
  };

  const predicate: any = {
    ...needsV2OrBackfill,
    ...(lastId ? { _id: { $gt: lastId } } : {}),
  };

  let migrated = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batch = await exercises
      .find(predicate, {
        sort: { _id: 1 },
        projection: {
          _id: 1,
          schemaVersion: 1,
          details: 1, // pull details wholesale
        },
      })
      .limit(BATCH)
      .toArray();

    if (!batch.length) break;

    const ops = batch.map((doc) => ({
      updateOne: {
        filter: {
          _id: doc._id,
          ...needsV2OrBackfill, // ensure we still need to touch it
        },
        update: { $set: v2PatchFor(doc) },
      },
    }));

    if (ops.length) await exercises.bulkWrite(ops, { ordered: false });

    migrated += batch.length;

    const newLastId = batch[batch.length - 1]._id;
    await checkpoints.updateOne(
      { key: MIGRATION_KEY },
      { $set: { lastId: newLastId } },
      { upsert: true }
    );

    // tiny breather for the cluster
    await new Promise((r) => setTimeout(r, 50));
  }

  console.log(`Backfill complete. Migrated or confirmed ~${migrated} docs.`);
  await mongoose.disconnect();
})();

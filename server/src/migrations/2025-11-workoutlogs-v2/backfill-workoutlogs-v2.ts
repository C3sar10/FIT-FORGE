// scripts/migrate-workoutlogs-v2.ts
import "dotenv/config";
import mongoose from "mongoose";
import { ObjectId } from "mongodb";

const BATCH = 1000;
const MIGRATION_KEY = "workoutlogs-v2";
type CheckpointDoc = { _id: ObjectId; key: string; lastId?: ObjectId };

function isNil(v: any) {
  return v === undefined || v === null;
}

function convertLegacyExerciseList(legacyList: any[]): any[] {
  if (!Array.isArray(legacyList)) return [];

  return legacyList.map((item: any, index: number) => {
    // Handle different legacy formats
    if (typeof item === "string") {
      // If it's just a string (exerciseId)
      return {
        exerciseId: new ObjectId(item),
        name: `Exercise ${index + 1}`,
        plannedSets: 3,
        plannedReps: 10,
        plannedRestSecs: 60,
        actualSets: [],
        completed: false,
      };
    }

    // If it's an object with some data
    return {
      exerciseId: item.exerciseId
        ? new ObjectId(item.exerciseId)
        : new ObjectId(),
      name: item.name || item.title || `Exercise ${index + 1}`,
      plannedSets: item.sets || item.plannedSets || 3,
      plannedReps: item.reps || item.plannedReps || 10,
      plannedRestSecs: item.restSecs || item.plannedRestSecs || 60,
      actualSets: item.actualSets || [],
      completed: item.completed || false,
      notes: item.notes || null,
      startTime: item.startTime || null,
      endTime: item.endTime || null,
    };
  });
}

function v2PatchForWorkoutLog(doc: any) {
  const patch: any = { schemaVersion: 2, updatedAt: new Date() };

  // Convert legacy exerciseList to new format
  if (doc.workoutDetails && doc.workoutDetails.exerciseList) {
    const convertedList = convertLegacyExerciseList(
      doc.workoutDetails.exerciseList
    );
    patch.workoutDetails = {
      ...doc.workoutDetails,
      exerciseList: convertedList,
    };
  } else {
    // Ensure workoutDetails exists with proper structure
    patch.workoutDetails = {
      workoutTimestamp: doc.workoutDetails?.workoutTimestamp || new Date(),
      workoutTitle: doc.workoutDetails?.workoutTitle || "Untitled Workout",
      workoutId: doc.workoutDetails?.workoutId || null,
      duration: doc.workoutDetails?.duration || 0,
      exerciseList: [],
      exercisesCompleted: doc.workoutDetails?.exercisesCompleted || [],
      type: doc.workoutDetails?.type || "strength",
    };
  }

  return patch;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const db = mongoose.connection.db!;
  const workoutlogs = db.collection("workoutlogs");
  const checkpoints = db.collection<CheckpointDoc>("migration_checkpoints");

  const cp = await checkpoints.findOne({ key: MIGRATION_KEY });
  const lastId = cp?.lastId;

  // Only pick docs that are < v2 OR missing proper exerciseList structure
  const needsV2OrBackfill = {
    $or: [
      { schemaVersion: { $exists: false } },
      { schemaVersion: { $lt: 2 } },
      { "workoutDetails.exerciseList.0.exerciseId": { $exists: false } },
      { "workoutDetails.exerciseList.0.plannedSets": { $exists: false } },
      { "workoutDetails.exerciseList.0.actualSets": { $exists: false } },
    ],
  };

  const predicate: any = {
    ...needsV2OrBackfill,
    ...(lastId ? { _id: { $gt: lastId } } : {}),
  };

  let migrated = 0;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const batch = await workoutlogs
      .find(predicate, {
        sort: { _id: 1 },
        projection: {
          _id: 1,
          schemaVersion: 1,
          workoutDetails: 1, // pull workoutDetails wholesale
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
        update: { $set: v2PatchForWorkoutLog(doc) },
      },
    }));

    if (ops.length) await workoutlogs.bulkWrite(ops, { ordered: false });

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

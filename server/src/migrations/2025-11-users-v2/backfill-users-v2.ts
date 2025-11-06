import "dotenv/config";
import mongoose from "mongoose";

const BATCH = 1000;
const MIGRATION_KEY = "users-v2";
type CheckpointDoc = { _id: string; key: string; lastId?: any };

function v2PatchFor(doc: any) {
  const patch: any = { schemaVersion: 2, updatedAt: new Date() };
  if (!doc.phone) patch.phone = { e164: null, verified: false };
  if (!doc.address)
    patch.address = {
      street: null,
      city: null,
      state: null,
      zipcode: null,
      country: null,
    };
  if (!doc.dob) patch.dob = null;
  if (!doc.gender) patch.gender = null;
  if (!doc.height)
    patch.height = {
      value: null,
      unit: null,
    };
  if (!doc.weight)
    patch.weight = {
      value: null,
      unit: null,
    };
  if (!doc.profilePicture)
    patch.profilePicture = {
      original: null,
      thumbnail: null,
      uploadedAt: null,
    };

  return patch;
}

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const db = mongoose.connection.db;
  const users = db?.collection("users");
  const checkpoints = db?.collection<CheckpointDoc>("migration_checkpoints");
  const cp = await checkpoints?.findOne({ key: MIGRATION_KEY });
  const lastId = cp?.lastId;

  const predicate: any = {
    $or: [
      { schemaVersion: { $exists: false } },
      { schemaVersion: { $lt: 2 } },
      { phone: { $exists: false } },
      { address: { $exists: false } },
      { dob: { $exists: false } },
      { gender: { $exists: false } },
      { height: { $exists: false } },
      { weight: { $exists: false } },
      { profilePicture: { $exists: false } },
    ],
    ...(lastId ? { _id: { $gt: lastId } } : {}),
  };

  let migrated = 0;
  while (true) {
    const batch = await users
      ?.find(predicate, {
        sort: { _id: 1 },
        projection: {
          _id: 1,
          phone: 1,
          address: 1,
          dob: 1,
          gender: 1,
          height: 1,
          weight: 1,
          profilePicture: 1,
          schemaVersion: 1,
        },
      })
      .limit(BATCH)
      .toArray();
    if (!batch || batch.length === 0) break;
    const ops = batch.map((doc) => ({
      updateOne: {
        filter: {
          _id: doc._id,
          $or: [
            { schemaVersion: { $exists: false } },
            { schemaVersion: { $lt: 2 } },
            { phone: { $exists: false } },
            { address: { $exists: false } },
            { dob: { $exists: false } },
            { gender: { $exists: false } },
            { height: { $exists: false } },
            { weight: { $exists: false } },
            { profilePicture: { $exists: false } },
          ],
        },
        update: { $set: v2PatchFor(doc) },
      },
    }));

    if (ops.length) await users?.bulkWrite(ops, { ordered: false });

    migrated += batch.length;
    const newLastId = batch[batch.length - 1]._id;
    await checkpoints?.updateOne(
      { key: MIGRATION_KEY },
      { $set: { lastId: newLastId } },
      { upsert: true }
    );

    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  console.log(`Backfill complete. Migrated or confirmed ~${migrated} docs.`);
  await mongoose.disconnect();
})();

import mongoose from "mongoose";

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const users = mongoose.connection.db?.collection("users");

  const total = await users?.countDocuments();
  const remaining = await users?.countDocuments({
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
  });
  console.log({
    total,
    remaining,
    migrated: total && remaining ? total - remaining : 0,
  });

  // spot check 20 docs
  const sample = await users
    ?.aggregate([
      { $match: { schemaVersion: 2 } },
      { $sample: { size: 20 } },
      {
        $project: {
          email: 1,
          phone: 1,
          address: 1,
          dob: 1,
          gender: 1,
          height: 1,
          weight: 1,
          profilePicture: 1,
        },
      },
    ])
    .toArray();

  console.log("Sample v2 docs: ", sample?.length);
  await mongoose.disconnect();
})();

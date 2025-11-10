// scripts/verify-workoutlogs-v2.ts
import "dotenv/config";
import mongoose from "mongoose";

(async () => {
  await mongoose.connect(process.env.MONGODB_URI || "");
  const workoutlogs = mongoose.connection.db!.collection("workoutlogs");

  const total = await workoutlogs.countDocuments();

  const remaining = await workoutlogs.countDocuments({
    $or: [
      { schemaVersion: { $exists: false } },
      { schemaVersion: { $lt: 2 } },
      { "workoutDetails.exerciseList.0.exerciseId": { $exists: false } },
      { "workoutDetails.exerciseList.0.plannedSets": { $exists: false } },
      { "workoutDetails.exerciseList.0.actualSets": { $exists: false } },
    ],
  });

  console.log({
    total,
    remaining,
    migrated: total != null && remaining != null ? total - remaining : 0,
  });

  // Optional: quick type sanity stats for v2 docs
  const shapeReport = await workoutlogs
    .aggregate([
      { $match: { schemaVersion: 2 } },
      {
        $unwind: {
          path: "$workoutDetails.exerciseList",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 0,
          exerciseIdType: { $type: "$workoutDetails.exerciseList.exerciseId" },
          nameType: { $type: "$workoutDetails.exerciseList.name" },
          plannedSetsType: {
            $type: "$workoutDetails.exerciseList.plannedSets",
          },
          plannedRepsType: {
            $type: "$workoutDetails.exerciseList.plannedReps",
          },
          actualSetsType: { $type: "$workoutDetails.exerciseList.actualSets" },
          completedType: { $type: "$workoutDetails.exerciseList.completed" },
        },
      },
      {
        $group: {
          _id: null,
          exerciseIdTypes: { $addToSet: "$exerciseIdType" },
          nameTypes: { $addToSet: "$nameType" },
          plannedSetsTypes: { $addToSet: "$plannedSetsType" },
          plannedRepsTypes: { $addToSet: "$plannedRepsType" },
          actualSetsTypes: { $addToSet: "$actualSetsType" },
          completedTypes: { $addToSet: "$completedType" },
        },
      },
    ])
    .toArray();

  console.log("Shape report (types seen among v2 docs):", shapeReport[0]);

  // Spot check 5 docs for the fields you care about
  const sample = await workoutlogs
    .aggregate([
      { $match: { schemaVersion: 2 } },
      { $sample: { size: 5 } },
      {
        $project: {
          title: 1,
          userName: 1,
          workoutDetails: {
            workoutTitle: 1,
            exerciseList: {
              $map: {
                input: "$workoutDetails.exerciseList",
                as: "exercise",
                in: {
                  exerciseId: "$$exercise.exerciseId",
                  name: "$$exercise.name",
                  plannedSets: "$$exercise.plannedSets",
                  plannedReps: "$$exercise.plannedReps",
                  actualSets: "$$exercise.actualSets",
                  completed: "$$exercise.completed",
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

  await mongoose.disconnect();
})();

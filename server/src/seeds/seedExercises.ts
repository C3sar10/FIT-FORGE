import "dotenv/config";
import mongoose from "mongoose";
import Exercise from "../models/Exercise";

// Helper to make a seed doc
const ex = (
  title: string,
  {
    type = "strength",
    tags = [] as string[],
    description = "",
    sets,
    reps,
    durationSecs,
    restSecs,
    equipment = [] as string[],
  }: {
    type?: "strength" | "endurance" | "sport" | "speed" | "other";
    tags?: string[];
    description?: string;
    sets?: number;
    reps?: number | string | null;
    durationSecs?: number | null;
    restSecs?: number;
    equipment?: string[];
  } = {}
) => ({
  author: "global",
  title,
  type,
  tags,
  description,
  details: {
    sets,
    reps: reps ?? undefined,
    durationSecs: durationSecs ?? undefined,
    restSecs,
    equipment,
  },
});

// ~20 core movements covering push/pull/legs + accessories
const SEEDS = [
  // Upper — Push
  ex("Bench Press", {
    tags: ["chest", "push", "barbell"],
    description: "Barbell press performed lying on a flat bench.",
    sets: 3,
    reps: "6-10",
    restSecs: 120,
    equipment: ["barbell", "bench", "plates"],
  }),
  ex("Incline Dumbbell Press", {
    tags: ["chest", "push", "dumbbell"],
    sets: 3,
    reps: "8-12",
    restSecs: 90,
    equipment: ["dumbbells", "bench"],
  }),
  ex("Overhead Press", {
    tags: ["shoulders", "push", "barbell"],
    sets: 3,
    reps: "6-10",
    restSecs: 120,
    equipment: ["barbell", "plates"],
  }),
  ex("Dumbbell Shoulder Press", {
    tags: ["shoulders", "push", "dumbbell"],
    sets: 3,
    reps: "8-12",
    restSecs: 90,
    equipment: ["dumbbells", "bench"],
  }),
  ex("Push-Up", {
    tags: ["chest", "push", "bodyweight"],
    sets: 3,
    reps: "10-20",
    restSecs: 60,
    equipment: [],
  }),

  // Upper — Pull
  ex("Pull-Up", {
    tags: ["back", "pull", "bodyweight"],
    sets: 3,
    reps: "5-10",
    restSecs: 120,
  }),
  ex("Lat Pulldown", {
    tags: ["back", "pull", "machine"],
    sets: 3,
    reps: "8-12",
    restSecs: 90,
    equipment: ["pulldown machine"],
  }),
  ex("Barbell Row", {
    tags: ["back", "pull", "barbell"],
    sets: 3,
    reps: "6-10",
    restSecs: 120,
    equipment: ["barbell", "plates"],
  }),
  ex("One-Arm Dumbbell Row", {
    tags: ["back", "pull", "dumbbell"],
    sets: 3,
    reps: "8-12",
    restSecs: 90,
    equipment: ["dumbbell", "bench"],
  }),
  ex("Face Pull", {
    tags: ["rear delts", "upper back", "cable"],
    sets: 3,
    reps: "12-15",
    restSecs: 60,
    equipment: ["cable", "rope"],
  }),

  // Lower
  ex("Back Squat", {
    tags: ["legs", "quad", "barbell"],
    sets: 3,
    reps: "5-8",
    restSecs: 180,
    equipment: ["barbell", "rack", "plates"],
  }),
  ex("Deadlift", {
    tags: ["posterior chain", "barbell"],
    sets: 3,
    reps: "3-5",
    restSecs: 180,
    equipment: ["barbell", "plates"],
  }),
  ex("Romanian Deadlift (RDL)", {
    tags: ["hamstrings", "glutes", "barbell"],
    sets: 3,
    reps: "6-10",
    restSecs: 150,
    equipment: ["barbell", "plates"],
  }),
  ex("Leg Press", {
    tags: ["legs", "quad", "machine"],
    sets: 3,
    reps: "10-15",
    restSecs: 120,
    equipment: ["leg press machine"],
  }),
  ex("Walking Lunge", {
    tags: ["legs", "glutes", "dumbbell"],
    sets: 3,
    reps: "20", // total steps
    restSecs: 90,
    equipment: ["dumbbells"],
  }),

  // Accessory / Arms / Core
  ex("Bicep Curl (Dumbbell)", {
    tags: ["biceps", "dumbbell"],
    sets: 3,
    reps: "10-15",
    restSecs: 60,
    equipment: ["dumbbells"],
  }),
  ex("Tricep Pushdown", {
    tags: ["triceps", "cable"],
    sets: 3,
    reps: "10-15",
    restSecs: 60,
    equipment: ["cable", "straight bar or rope"],
  }),
  ex("Lateral Raise", {
    tags: ["shoulders", "dumbbell"],
    sets: 3,
    reps: "12-15",
    restSecs: 60,
    equipment: ["dumbbells"],
  }),
  ex("Plank", {
    tags: ["core", "bodyweight"],
    sets: 3,
    reps: null,
    durationSecs: 45,
    restSecs: 60,
  }),
  ex("Hanging Leg Raise", {
    tags: ["core", "bodyweight"],
    sets: 3,
    reps: "8-12",
    restSecs: 60,
    equipment: ["pull-up bar"],
  }),
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Mongo connected");

  let inserted = 0;
  for (const doc of SEEDS) {
    // Idempotent: only insert if (title, author:'global') not present
    const res = await Exercise.updateOne(
      { title: doc.title, author: "global" },
      { $setOnInsert: doc },
      { upsert: true }
    );
    // @ts-ignore res.upsertedCount exists on the driver result
    if ((res as any).upsertedCount || (res as any).upsertedId) inserted++;
  }

  console.log(
    `Seed complete. Total global exercises: +${inserted} (inserted if missing).`
  );
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});

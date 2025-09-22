import "dotenv/config";
import mongoose from "mongoose";
import Exercise from "../models/Exercise";

// Helper to make a seed doc
type ExerciseSeedOpts = {
  type?: "strength" | "endurance" | "sport" | "speed" | "other";
  tags?: string[];
  description?: string;
  sets?: number;
  reps?: number | string | null; // allow "6-10" or number
  durationSecs?: number | null;
  restSecs?: number;
  equipment?: string[];
  image?: string; // NEW
};

const ex = (title: string, opts: ExerciseSeedOpts = {}) => ({
  author: "global",
  title,
  type: opts.type ?? "strength",
  tags: opts.tags ?? [],
  description: opts.description ?? "",
  details: {
    sets: opts.sets,
    reps: opts.reps ?? undefined,
    durationSecs: opts.durationSecs ?? undefined,
    restSecs: opts.restSecs,
    equipment: opts.equipment ?? [],
  },
  image: opts.image, // <-- fixed
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
    image: "/exercises/bench-press.jpg",
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
    image: "/exercises/pushup.jpg",
  }),

  // Upper — Pull
  ex("Pull-Up", {
    tags: ["back", "pull", "bodyweight"],
    sets: 3,
    reps: "5-10",
    restSecs: 120,
    image: "/exercises/pull-ups.jpg",
  }),
  ex("Lat Pulldown", {
    tags: ["back", "pull", "machine"],
    sets: 3,
    reps: "8-12",
    restSecs: 90,
    equipment: ["pulldown machine"],
    image: "/exercises/pull-ups.jpg",
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
    image: "/exercises/barbell-squat.jpg",
  }),
  ex("Deadlift", {
    tags: ["posterior chain", "barbell"],
    sets: 3,
    reps: "3-5",
    restSecs: 180,
    equipment: ["barbell", "plates"],
    image: "/exercises/deadlift.jpg",
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
    image: "/exercises/walking-lunges.jpg",
  }),

  // Accessory / Arms / Core
  ex("Bicep Curl (Dumbbell)", {
    tags: ["biceps", "dumbbell"],
    sets: 3,
    reps: "10-15",
    restSecs: 60,
    equipment: ["dumbbells"],
    image: "/exercises/dumbell-curls.jpg",
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
    image: "/exercises/plank.jpg",
  }),
  ex("Hanging Leg Raise", {
    tags: ["core", "bodyweight"],
    sets: 3,
    reps: "8-12",
    restSecs: 60,
    equipment: ["pull-up bar"],
    image: "/exercises/hanging-leg-raise.jpg",
  }),
];

// ...same imports & SEEDS as you have above

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Mongo connected");

  // Build bulk ops without path conflicts
  const ops = SEEDS.map((doc) => {
    // split image from the rest
    const { image, ...rest } = doc as { image?: string } & Record<string, any>;

    const update: any = { $setOnInsert: rest };

    // only set image when we actually have a value
    if (typeof image !== "undefined") {
      update.$set = { image };
    }

    return {
      updateOne: {
        filter: { title: doc.title, author: "global" },
        update,
        upsert: true,
      },
    };
  });

  const res = await Exercise.bulkWrite(ops, { ordered: false });

  console.log(
    `Seed complete. inserted=${res.upsertedCount || 0}, modified=${
      res.modifiedCount || 0
    }, matched=${res.matchedCount || 0}`
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

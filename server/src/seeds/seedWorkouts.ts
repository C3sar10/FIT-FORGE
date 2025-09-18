import "dotenv/config";
import mongoose, { Types } from "mongoose";
import Exercise from "../models/Exercise";
import Workout from "../models/Workout";

/**
 * Helpers
 */
type Item = {
  t: string; // exercise title (to resolve to _id)
  sets?: number;
  reps?: number | string | null;
  restSecs?: number;
};

type Block = { title?: string; items: Item[] };

type WSeed = {
  name: string;
  description?: string;
  type?: "strength" | "endurance" | "sport" | "speed" | "other";
  tags?: string[]; // include "featured" to mark as featured
  image?: string; // optional cover, e.g. '/workouts/push.jpg'
  blocks: Block[];
};

/** Resolve exercise titles -> ObjectIds, throw if missing */
async function resolveExerciseIds(
  seeds: WSeed[],
  titleToId: Map<string, Types.ObjectId>
) {
  for (const w of seeds) {
    for (const b of w.blocks) {
      for (const it of b.items) {
        if (!titleToId.has(it.t)) {
          throw new Error(
            `Exercise not found: "${it.t}". Seed exercises first or fix the title.`
          );
        }
      }
    }
  }
}

/** Build a Mongo-ready workout doc from a WSeed */
function buildWorkoutDoc(seed: WSeed, titleToId: Map<string, Types.ObjectId>) {
  return {
    userId: "global",
    author: "global",
    name: seed.name,
    description: seed.description ?? "",
    type: seed.type ?? "strength",
    tags: seed.tags ?? [],
    isFavorite: false,
    image: seed.image,
    blocks: seed.blocks.map((b) => ({
      title: b.title,
      items: b.items.map((it) => ({
        exerciseId: titleToId.get(it.t)!,
        sets: it.sets,
        reps: it.reps,
        restSecs: it.restSecs,
      })),
    })),
  };
}

/**
 * Seed data — 10 workouts total, 5 tagged as "featured"
 * Images are optional; place them under Next /public/workouts/{file}.jpg if used.
 */
const WORKOUTS: WSeed[] = [
  // 1) Featured
  {
    name: "Push Day (Chest/Shoulders/Triceps)",
    description: "Compound press focus with accessory delts and triceps.",
    tags: ["push", "chest", "shoulders", "triceps", "featured"],
    image: "/workouts/push.jpg",
    blocks: [
      {
        title: "Main",
        items: [
          { t: "Bench Press", sets: 4, reps: "6-10", restSecs: 120 },
          { t: "Overhead Press", sets: 3, reps: "6-10", restSecs: 120 },
        ],
      },
      {
        title: "Accessory",
        items: [
          { t: "Incline Dumbbell Press", sets: 3, reps: "8-12", restSecs: 90 },
          { t: "Tricep Pushdown", sets: 3, reps: "10-15", restSecs: 60 },
          { t: "Lateral Raise", sets: 3, reps: "12-15", restSecs: 60 },
        ],
      },
    ],
  },

  // 2) Featured
  {
    name: "Pull Day (Back/Biceps)",
    description:
      "Vertical pull + horizontal row, finish with biceps and rear delts.",
    tags: ["pull", "back", "biceps", "featured"],
    image: "/workouts/pull.jpg",
    blocks: [
      {
        title: "Main",
        items: [
          { t: "Pull-Up", sets: 4, reps: "5-10", restSecs: 120 },
          { t: "Barbell Row", sets: 3, reps: "6-10", restSecs: 120 },
        ],
      },
      {
        title: "Accessory",
        items: [
          { t: "Lat Pulldown", sets: 3, reps: "8-12", restSecs: 90 },
          { t: "One-Arm Dumbbell Row", sets: 3, reps: "8-12", restSecs: 90 },
          { t: "Bicep Curl (Dumbbell)", sets: 3, reps: "10-15", restSecs: 60 },
          { t: "Face Pull", sets: 3, reps: "12-15", restSecs: 60 },
        ],
      },
    ],
  },

  // 3) Featured
  {
    name: "Leg Day (Squat Focus)",
    description: "Heavy squat, hinge accessory, quad volume.",
    tags: ["legs", "strength", "featured"],
    image: "/workouts/legs.jpg",
    blocks: [
      {
        title: "Main",
        items: [{ t: "Back Squat", sets: 5, reps: "5-8", restSecs: 180 }],
      },
      {
        title: "Accessory",
        items: [
          {
            t: "Romanian Deadlift (RDL)",
            sets: 3,
            reps: "6-10",
            restSecs: 150,
          },
          { t: "Leg Press", sets: 3, reps: "10-15", restSecs: 120 },
          { t: "Walking Lunge", sets: 3, reps: "20", restSecs: 90 },
        ],
      },
    ],
  },

  // 4) Featured
  {
    name: "Upper Body — Strength",
    description:
      "Classic upper split with a strength bias on presses and rows.",
    tags: ["upper", "strength", "featured"],
    image: "/workouts/upper-strength.jpg",
    blocks: [
      {
        title: "Main",
        items: [
          { t: "Bench Press", sets: 4, reps: "5-8", restSecs: 150 },
          { t: "Barbell Row", sets: 4, reps: "6-8", restSecs: 150 },
        ],
      },
      {
        title: "Accessory",
        items: [
          { t: "Dumbbell Shoulder Press", sets: 3, reps: "8-12", restSecs: 90 },
          { t: "Bicep Curl (Dumbbell)", sets: 3, reps: "10-15", restSecs: 60 },
          { t: "Tricep Pushdown", sets: 3, reps: "10-15", restSecs: 60 },
        ],
      },
    ],
  },

  // 5) Featured
  {
    name: "Full Body — A",
    description: "Full body day emphasizing squat + press.",
    tags: ["full body", "featured"],
    image: "/workouts/full-a.jpg",
    blocks: [
      {
        title: "Main",
        items: [
          { t: "Back Squat", sets: 4, reps: "5-8", restSecs: 180 },
          { t: "Overhead Press", sets: 3, reps: "6-10", restSecs: 120 },
        ],
      },
      {
        title: "Accessory",
        items: [
          { t: "One-Arm Dumbbell Row", sets: 3, reps: "8-12", restSecs: 90 },
          { t: "Plank", sets: 3, reps: null, restSecs: 60 },
        ],
      },
    ],
  },

  // 6) Non-featured
  {
    name: "Full Body — B",
    description: "Full body day emphasizing deadlift + horizontal push.",
    tags: ["full body"],
    image: "/workouts/full-b.jpg",
    blocks: [
      {
        title: "Main",
        items: [
          { t: "Deadlift", sets: 3, reps: "3-5", restSecs: 180 },
          { t: "Incline Dumbbell Press", sets: 3, reps: "8-12", restSecs: 90 },
        ],
      },
      {
        title: "Accessory",
        items: [
          { t: "Lat Pulldown", sets: 3, reps: "8-12", restSecs: 90 },
          { t: "Hanging Leg Raise", sets: 3, reps: "8-12", restSecs: 60 },
        ],
      },
    ],
  },

  // 7) Non-featured
  {
    name: "Chest & Triceps",
    description: "Press variations plus focused triceps work.",
    tags: ["chest", "triceps", "push"],
    image: "/workouts/chest-tris.jpg",
    blocks: [
      {
        title: "Main",
        items: [
          { t: "Bench Press", sets: 4, reps: "6-10", restSecs: 120 },
          { t: "Incline Dumbbell Press", sets: 3, reps: "8-12", restSecs: 90 },
        ],
      },
      {
        title: "Accessory",
        items: [
          { t: "Tricep Pushdown", sets: 3, reps: "10-15", restSecs: 60 },
          { t: "Push-Up", sets: 3, reps: "10-20", restSecs: 60 },
        ],
      },
    ],
  },

  // 8) Non-featured
  {
    name: "Back & Biceps",
    description: "Pull variations plus focused biceps work.",
    tags: ["back", "biceps", "pull"],
    image: "/workouts/back-bis.jpg",
    blocks: [
      {
        title: "Main",
        items: [
          { t: "Pull-Up", sets: 4, reps: "5-10", restSecs: 120 },
          { t: "Barbell Row", sets: 3, reps: "6-10", restSecs: 120 },
        ],
      },
      {
        title: "Accessory",
        items: [
          { t: "One-Arm Dumbbell Row", sets: 3, reps: "8-12", restSecs: 90 },
          { t: "Bicep Curl (Dumbbell)", sets: 3, reps: "10-15", restSecs: 60 },
        ],
      },
    ],
  },

  // 9) Non-featured
  {
    name: "Lower — Posterior Chain",
    description: "Hinge-dominant lower session.",
    tags: ["legs", "posterior chain"],
    image: "/workouts/post-chain.jpg",
    blocks: [
      {
        title: "Main",
        items: [
          { t: "Deadlift", sets: 3, reps: "3-5", restSecs: 180 },
          {
            t: "Romanian Deadlift (RDL)",
            sets: 3,
            reps: "6-10",
            restSecs: 150,
          },
        ],
      },
      {
        title: "Accessory",
        items: [
          { t: "Walking Lunge", sets: 3, reps: "20", restSecs: 90 },
          { t: "Plank", sets: 3, reps: null, restSecs: 60 },
        ],
      },
    ],
  },

  // 10) Non-featured
  {
    name: "Shoulders & Arms",
    description: "Delts focus with curls and triceps to finish.",
    tags: ["shoulders", "arms"],
    image: "/workouts/shoulders-arms.jpg",
    blocks: [
      {
        title: "Main",
        items: [
          { t: "Dumbbell Shoulder Press", sets: 4, reps: "8-12", restSecs: 90 },
          { t: "Lateral Raise", sets: 3, reps: "12-15", restSecs: 60 },
        ],
      },
      {
        title: "Accessory",
        items: [
          { t: "Bicep Curl (Dumbbell)", sets: 3, reps: "10-15", restSecs: 60 },
          { t: "Tricep Pushdown", sets: 3, reps: "10-15", restSecs: 60 },
        ],
      },
    ],
  },
];

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Missing MONGODB_URI");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Mongo connected");

  // Build a title -> _id lookup for exercises the seeds reference
  const exDocs = await Exercise.find({ author: "global" })
    .select("title _id")
    .lean();
  const titleToId = new Map<string, Types.ObjectId>();
  exDocs.forEach((d: any) => titleToId.set(d.title, d._id));

  await resolveExerciseIds(WORKOUTS, titleToId);

  let upserted = 0;
  for (const w of WORKOUTS) {
    const doc = buildWorkoutDoc(w, titleToId);

    const res = await Workout.updateOne(
      { name: doc.name, author: "global" }, // idempotent key
      {
        $set: {
          description: doc.description,
          type: doc.type,
          tags: doc.tags,
          image: doc.image,
          blocks: doc.blocks,
          userId: "global",
          author: "global",
        },
        $setOnInsert: {
          isFavorite: false,
          createdAt: new Date(),
        },
      },
      { upsert: true }
    );

    // @ts-ignore upsertedCount exists on the driver result
    if ((res as any).upsertedCount || (res as any).upsertedId) upserted++;
  }

  console.log(
    `Seed complete. Global workouts upserted (new): +${upserted}. Total defined: ${WORKOUTS.length}.`
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

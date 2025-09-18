import { Schema, model, InferSchemaType } from "mongoose";

const ExerciseSchema = new Schema(
  {
    // "author" is "global" for seeded items, or the user's id for custom
    author: { type: String, index: true, required: true }, // 'global' | userId
    title: { type: String, index: true, required: true },
    type: {
      type: String,
      enum: ["strength", "endurance", "sport", "speed", "other"],
      default: "strength",
    },
    tags: { type: [String], default: [] },
    description: { type: String },
    details: {
      sets: { type: Number }, // default sets (optional)
      reps: { type: Schema.Types.Mixed }, // number or "6-10"
      durationSecs: { type: Number }, // for timed moves
      restSecs: { type: Number },
      equipment: { type: [String], default: [] },
    },
  },
  { timestamps: true }
);

ExerciseSchema.index({ author: 1, title: 1 });

export type ExerciseDoc = InferSchemaType<typeof ExerciseSchema>;
export default model<ExerciseDoc>("Exercise", ExerciseSchema);

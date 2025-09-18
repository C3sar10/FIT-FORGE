import { Schema, model, InferSchemaType, Types } from "mongoose";

const WorkoutItemSchema = new Schema(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    sets: { type: Number }, // if omitted, use exercise defaults
    reps: { type: Schema.Types.Mixed },
    restSecs: { type: Number },
  },
  { _id: false }
);

const WorkoutSchema = new Schema(
  {
    userId: { type: String, index: true, required: true },
    author: { type: String, required: true }, // same as userId (or 'global' later)
    name: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["strength", "endurance", "sport", "speed", "other"],
      default: "strength",
    },
    tags: { type: [String], default: [] },
    isFavorite: { type: Boolean, default: false },
    blocks: [
      {
        title: { type: String },
        items: { type: [WorkoutItemSchema], default: [] },
      },
    ],
  },
  { timestamps: true }
);

WorkoutSchema.index({ userId: 1, updatedAt: -1 });
WorkoutSchema.index({ userId: 1, isFavorite: 1, updatedAt: -1 });

export type WorkoutDoc = InferSchemaType<typeof WorkoutSchema>;
export default model<WorkoutDoc>("Workout", WorkoutSchema);

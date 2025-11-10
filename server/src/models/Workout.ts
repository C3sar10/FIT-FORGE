import { Schema, model, InferSchemaType, Types } from "mongoose";
import { number } from "zod";

const WorkoutItemSchema = new Schema(
  {
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: "Exercise",
      required: true,
    },
    name: { type: String },
    sets: { type: Number }, // if omitted, use exercise defaults
    reps: { type: Schema.Types.Mixed },
    restSecs: { type: Number },
    repObj: {
      repType: {
        type: String,
        enum: [
          "number",
          "duration",
          "distance",
          "time",
          "repRange",
          "timeRange",
          "other",
        ],
        default: "number",
      },
      repNumber: { type: Number, required: false },
      repRange: {
        min: { type: Number, required: false },
        max: { type: Number, required: false },
      },
      timeRange: {
        min: {
          time: { type: Number, required: false },
          unit: { type: String, required: false },
        },
        max: {
          time: { type: Number, required: false },
          unit: { type: String, required: false },
        },
      },
      repDuration: {
        time: { type: Number, required: false },
        unit: { type: String, required: false },
      },
      repDistance: {
        distance: { type: Number, required: false },
        unit: { type: String, required: false },
      },
      restTimeSets: {
        time: { type: Number, required: false },
        unit: { type: String, required: false },
      },
      restTimeReps: {
        time: { type: Number, required: false },
        unit: { type: String, required: false },
      },
      targetMetric: {
        type: { type: String, required: false },
        unit: { type: String, required: false },
        number: { type: Number, required: false },
        name: { type: String, required: false },
      },
      equipment: { type: [String], default: [] },
    },
  },
  { _id: false }
);

const WorkoutSchema = new Schema(
  {
    userId: { type: String, index: true, required: true },
    author: { type: String, required: true }, // same as userId (or 'global' later)
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
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
    schemaVersion: { type: Number, default: 1 },
  },
  { timestamps: true }
);

WorkoutSchema.index({ userId: 1, updatedAt: -1 });
WorkoutSchema.index({ userId: 1, isFavorite: 1, updatedAt: -1 });
WorkoutSchema.index({ schemaVersion: 1 });

export type WorkoutDoc = InferSchemaType<typeof WorkoutSchema>;
export default model<WorkoutDoc>("Workout", WorkoutSchema);

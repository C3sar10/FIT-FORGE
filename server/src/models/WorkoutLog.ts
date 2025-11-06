import { Schema, model, InferSchemaType } from "mongoose";

const WorkoutLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, index: true, required: true }, // Reference to user (ObjectId for efficiency)
    userName: { type: String, required: true }, // Denormalized for quick display
    title: { type: String, required: true },
    createdOn: { type: Date, default: Date.now }, // Auto-set on create
    workoutDate: { type: Date }, // Date of the workout
    lastUpdated: { type: Date, default: Date.now }, // Update on save
    description: { type: String },
    workoutDetails: {
      workoutTimestamp: { type: Date, required: true },
      workoutTitle: { type: String, required: true },
      workoutId: { type: Schema.Types.ObjectId || null, required: false }, // Reference to workout
      duration: { type: Schema.Types.Mixed }, // String or number (e.g., "30min" or 1800 secs)
      exerciseList: [
        {
          type: Schema.Types.Mixed,
        },
      ],
      exercisesCompleted: [{ type: String }], // Array of exercise IDs completed
      type: { type: String, required: true },
    },
    rating: { type: Number, min: 0, max: 5 }, // Optional 0-5
    intensity: { type: Number, min: 0, max: 10 }, // Optional 0-10
    notes: { type: String },
  },
  { timestamps: true } // Auto-adds createdAt/updatedAt
);

// Indexes for fast queries (e.g., by user and date)
WorkoutLogSchema.index({ userId: 1, createdOn: -1 });

export type WorkoutLogDoc = InferSchemaType<typeof WorkoutLogSchema>;
export default model<WorkoutLogDoc>("WorkoutLog", WorkoutLogSchema);

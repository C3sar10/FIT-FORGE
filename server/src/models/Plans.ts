import { Schema, model, InferSchemaType } from "mongoose";

const PlanSchema = new Schema(
  {
    userId: { type: String, index: true, required: true },
    title: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String },
    deadline: { type: Date },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    tags: { type: [String], default: [] },
  },
  { timestamps: true }
);

export type PlanDoc = InferSchemaType<typeof PlanSchema>;
export default model<PlanDoc>("Plan", PlanSchema);
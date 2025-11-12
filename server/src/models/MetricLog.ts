import { Schema, model, Document } from "mongoose";

export interface IMetricLog extends Document {
  userId: string;
  userName: string;
  date: Date;
  createdAt: Date;
  lastUpdated: Date;
  metrics: {
    weight?: {
      value: number;
      unit: "kg" | "lbs";
    };
    bodyFat?: {
      value: number; // percentage
    };
    height?: {
      value: number;
      unit: "cm" | "ft" | "in";
    };
  };
  notes?: string;
}

const metricLogSchema = new Schema<IMetricLog>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    userName: {
      type: String,
      required: false,
    },
    date: {
      type: Date,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    metrics: {
      weight: {
        type: {
          value: { type: Number, min: 0 },
          unit: { type: String, enum: ["kg", "lbs"] },
        },
        required: false,
      },
      bodyFat: {
        type: {
          value: { type: Number, min: 0, max: 100 },
        },
        required: false,
      },
      height: {
        type: {
          value: { type: Number, min: 0 },
          unit: { type: String, enum: ["cm", "ft", "in"] },
        },
        required: false,
      },
    },
    notes: {
      type: String,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient querying by user and date
metricLogSchema.index({ userId: 1, date: -1 });

// Ensure one log per user per day (optional - remove if multiple logs per day are needed)
// metricLogSchema.index({ userId: 1, date: 1 }, { unique: true });

export default model<IMetricLog>("MetricLog", metricLogSchema);

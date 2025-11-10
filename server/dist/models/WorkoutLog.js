"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Schema for individual set performance tracking
const SetPerformanceSchema = new mongoose_1.Schema({
    setNumber: { type: Number, required: true },
    reps: { type: Number, required: true },
    weight: { type: Number, required: false }, // Optional for non-weight exercises
    restTime: { type: Number, required: false }, // Actual rest time in seconds
    completed: { type: Boolean, default: false },
    notes: { type: String, required: false },
}, { _id: false });
// Enhanced exercise log entry schema
const ExerciseLogEntrySchema = new mongoose_1.Schema({
    exerciseId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    name: { type: String, required: true },
    // Planned values from workout/exercise
    plannedSets: { type: Number, required: true },
    plannedReps: { type: mongoose_1.Schema.Types.Mixed, required: true }, // Can be number or string like "6-10"
    plannedRestSecs: { type: Number, required: false },
    // Actual performance data
    actualSets: { type: [SetPerformanceSchema], default: [] },
    completed: { type: Boolean, default: false },
    notes: { type: String, required: false },
    // Timestamps for exercise tracking
    startTime: { type: Date, required: false },
    endTime: { type: Date, required: false },
}, { _id: false });
const WorkoutLogSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, index: true, required: true }, // Reference to user (ObjectId for efficiency)
    userName: { type: String, required: true }, // Denormalized for quick display
    title: { type: String, required: true },
    createdOn: { type: Date, default: Date.now }, // Auto-set on create
    workoutDate: { type: Date }, // Date of the workout
    lastUpdated: { type: Date, default: Date.now }, // Update on save
    description: { type: String },
    workoutDetails: {
        workoutTimestamp: { type: Date, required: true },
        workoutTitle: { type: String, required: true },
        workoutId: { type: mongoose_1.Schema.Types.ObjectId || null, required: false }, // Reference to workout
        duration: { type: mongoose_1.Schema.Types.Mixed }, // String or number (e.g., "30min" or 1800 secs)
        exerciseList: { type: [ExerciseLogEntrySchema], default: [] }, // Updated to use structured schema
        exercisesCompleted: [{ type: String }], // Keep for backward compatibility
        type: { type: String, required: true },
    },
    rating: { type: Number, min: 0, max: 5 }, // Optional 0-5
    intensity: { type: Number, min: 0, max: 10 }, // Optional 0-10
    notes: { type: String },
    schemaVersion: { type: Number, default: 1 }, // Add versioning for migration support
}, { timestamps: true } // Auto-adds createdAt/updatedAt
);
// Indexes for fast queries (e.g., by user and date)
WorkoutLogSchema.index({ userId: 1, createdOn: -1 });
WorkoutLogSchema.index({ schemaVersion: 1 });
exports.default = (0, mongoose_1.model)("WorkoutLog", WorkoutLogSchema);

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const EventSchema = new mongoose_1.Schema({
    author: { type: String, index: true, required: true }, // 'global' | userId
    title: { type: String, index: true, required: true },
    type: {
        type: String,
        enum: ["workout", "log"],
        required: true,
    },
    date: { type: Date, required: true },
    workoutDetails: {
        workoutId: { type: String }, // reference to Workout
        name: { type: String },
        notes: { type: String },
        image: { type: String, required: false },
        // add more as needed
    },
    logDetails: {
        logId: { type: String }, // reference to WorkoutLog
        summary: { type: String },
        notes: { type: String },
        // add more as needed
    },
    tags: { type: [String], default: [] },
    description: { type: String },
    completed: { type: Boolean, default: false },
}, { timestamps: true });
EventSchema.index({ author: 1, date: 1 });
exports.default = (0, mongoose_1.model)("Event", EventSchema);

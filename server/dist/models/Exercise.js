"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const ExerciseSchema = new mongoose_1.Schema({
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
    image: { type: String, default: null },
    demoUrl: { type: String },
    details: {
        sets: { type: Number }, // default sets (optional)
        reps: { type: mongoose_1.Schema.Types.Mixed }, // number or "6-10"
        restSecs: { type: Number }, // default rest seconds (optional)
        //durationSecs: { type: Number }, // for timed moves
        //Created additional fields to improve exercise experience and track better metrics
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
    schemaVersion: { type: Number, default: 1 },
}, { timestamps: true });
ExerciseSchema.index({ author: 1, title: 1 });
ExerciseSchema.index({ schemaVersion: 1 });
exports.default = (0, mongoose_1.model)("Exercise", ExerciseSchema);

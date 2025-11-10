"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// server/src/models/User.ts
const mongoose_1 = require("mongoose");
const SessionSchema = new mongoose_1.Schema({
    tokenId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });
const ProviderSchema = new mongoose_1.Schema({
    type: { type: String, enum: ["google", "apple"], required: true },
    providerUserId: { type: String, required: true },
}, { _id: false });
const PhoneSchema = new mongoose_1.Schema({
    e164: { type: String, default: null },
    verified: { type: Boolean, default: false },
}, { _id: false });
const AddressSchema = new mongoose_1.Schema({
    street: { type: String, default: null },
    city: { type: String, default: null },
    state: { type: String, default: null },
    country: { type: String, default: null },
    zipcode: { type: String, default: null },
}, { _id: false });
const ProfilePictureSchema = new mongoose_1.Schema({
    original: { type: String, required: false },
    thumbnail: { type: String, required: false },
    uploadedAt: { type: Date, required: false },
}, { _id: false });
const UserSchema = new mongoose_1.Schema({
    email: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String }, // nullable for OAuth-only accounts
    name: { type: String },
    providers: { type: [ProviderSchema], default: [] },
    sessions: { type: [SessionSchema], default: [] },
    //version 2 fields
    phone: { type: PhoneSchema, default: undefined },
    address: { type: AddressSchema, default: undefined },
    dob: { type: Date, default: null },
    gender: {
        type: String,
        enum: ["male", "female", "other", ""],
        default: null,
    },
    height: {
        value: { type: Number, default: null },
        unit: { type: String, enum: ["cm", "in", ""], default: "in" },
    },
    weight: {
        value: { type: Number, default: null },
        unit: { type: String, enum: ["kg", "lb", ""], default: "lb" },
    },
    profilePicture: { type: ProfilePictureSchema, default: undefined },
    favoriteWorkouts: { type: [String], default: [] }, // Array of workout IDs
    schemaVersion: { type: Number, default: 1 },
}, { timestamps: true });
UserSchema.index({ "phone.e164": 1 }, { sparse: true });
UserSchema.index({ schemaVersion: 1 });
const User = (0, mongoose_1.model)("User", UserSchema);
exports.default = User;

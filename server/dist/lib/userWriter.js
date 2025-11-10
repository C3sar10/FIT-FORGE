"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserV2 = updateUserV2;
const User_1 = __importDefault(require("../models/User"));
const featureFlags_1 = require("./featureFlags");
async function updateUserV2(userId, payload) {
    // Implementation for updating user with version 2 schema
    const v2Patch = featureFlags_1.featureFlags.writeUsersV2
        ? {
            schemaVersion: 2,
            ...payload(payload.phone && {
                phone: {
                    e164: payload.phone.e164 ?? null,
                    verified: !!payload.phone.verified,
                },
            }),
            ...payload(payload.address && { address: { ...payload.address } }),
            ...payload(payload.dob && { dob: payload.dob }),
            ...payload(payload.gender && { gender: payload.gender }),
            ...payload(payload.height && { height: { ...payload.height } }),
            ...payload(payload.weight && { weight: { ...payload.weight } }),
        }
        : {
            ...(payload.name && { name: payload.name }),
        };
    return User_1.default.findByIdAndUpdate(userId, { $set: v2Patch, $setOnInsert: { email: payload.email } }, { new: true, upsert: false });
}

// server/src/models/User.ts
import { Schema, model, InferSchemaType } from "mongoose";

const SessionSchema = new Schema(
  {
    tokenId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ProviderSchema = new Schema(
  {
    type: { type: String, enum: ["google", "apple"], required: true },
    providerUserId: { type: String, required: true },
  },
  { _id: false }
);

const UserSchema = new Schema(
  {
    email: { type: String, unique: true, index: true, required: true },
    passwordHash: { type: String }, // nullable for OAuth-only accounts
    name: { type: String },
    providers: { type: [ProviderSchema], default: [] },
    sessions: { type: [SessionSchema], default: [] },
  },
  { timestamps: true }
);

export type UserDoc = InferSchemaType<typeof UserSchema>;
const User = model<UserDoc>("User", UserSchema);
export default User;

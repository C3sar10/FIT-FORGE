import User from "../models/User";
import { featureFlags } from "./featureFlags";

export async function updateUserV2(userId: string, payload: any) {
  // Implementation for updating user with version 2 schema
  const v2Patch: any = featureFlags.writeUsersV2
    ? {
        schemaVersion: 2,
        ...payload(
          payload.phone && {
            phone: {
              e164: payload.phone.e164 ?? null,
              verified: !!payload.phone.verified,
            },
          }
        ),
        ...payload(payload.address && { address: { ...payload.address } }),
        ...payload(payload.dob && { dob: payload.dob }),
        ...payload(payload.gender && { gender: payload.gender }),
        ...payload(payload.height && { height: { ...payload.height } }),
        ...payload(payload.weight && { weight: { ...payload.weight } }),
      }
    : {
        ...(payload.name && { name: payload.name }),
      };

  return User.findByIdAndUpdate(
    userId,
    { $set: v2Patch, $setOnInsert: { email: payload.email } },
    { new: true, upsert: false }
  );
}

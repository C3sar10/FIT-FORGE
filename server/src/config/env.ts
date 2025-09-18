import "dotenv/config";
import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce.number().default(4000),
  MONGODB_URI: z.string().url(),

  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  ACCESS_TOKEN_TTL: z.coerce.number().positive(), // seconds
  REFRESH_TOKEN_TTL: z.coerce.number().positive(), // seconds

  CORS_ORIGIN: z.string(),
  COOKIE_DOMAIN: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

export const env = EnvSchema.parse(process.env);
export const isProd = env.NODE_ENV === "production";

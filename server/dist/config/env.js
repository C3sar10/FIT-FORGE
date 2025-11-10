"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isProd = exports.env = void 0;
require("dotenv/config");
const zod_1 = require("zod");
const EnvSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().default(4000),
    MONGODB_URI: zod_1.z.string().url(),
    JWT_ACCESS_SECRET: zod_1.z.string().min(32),
    JWT_REFRESH_SECRET: zod_1.z.string().min(32),
    ACCESS_TOKEN_TTL: zod_1.z.coerce.number().positive(), // seconds
    REFRESH_TOKEN_TTL: zod_1.z.coerce.number().positive(), // seconds
    CORS_ORIGIN: zod_1.z.string(),
    COOKIE_DOMAIN: zod_1.z.string(),
    NODE_ENV: zod_1.z
        .enum(["development", "production", "test"])
        .default("development"),
});
exports.env = EnvSchema.parse(process.env);
exports.isProd = exports.env.NODE_ENV === "production";

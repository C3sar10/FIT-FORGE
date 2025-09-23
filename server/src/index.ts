import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import mongoose from "mongoose";

import { env } from "./config/env";
import authRouter from "./routes/auth";
import { ApiError } from "./utils/ApiError";

import exerciseRouter from "./routes/exercises";
import workoutRouter from "./routes/workouts";

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "https://fit-forge-drab.vercel.app",
  ,
];

app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// routes
app.use("/auth", authRouter);

import { requireAuth } from "./middleware/requireAuth";
app.get("/whoami", requireAuth, (req, res) => {
  res.json({ userId: (req as any).user.userId });
});

app.use("/exercises", exerciseRouter);
app.use("/workouts", workoutRouter);

// error handler
app.use(
  (err: any, _req: express.Request, res: express.Response, _next: any) => {
    if (err.name === "ZodError") {
      return res.status(400).json({
        error: "ZOD_ERROR",
        message: err.errors?.[0]?.message ?? "Invalid input",
      });
    }
    if (err instanceof ApiError) {
      return res
        .status(err.status)
        .json({ error: err.code, message: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "INTERNAL", message: "Server error" });
  }
);

// start
(async () => {
  await mongoose.connect(env.MONGODB_URI);
  console.log("Mongo connected");
  app.listen(env.PORT, () =>
    console.log(`API listening on http://localhost:${env.PORT}`)
  );
})();

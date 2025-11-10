"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./config/env");
const auth_1 = __importDefault(require("./routes/auth"));
const ApiError_1 = require("./utils/ApiError");
const exercises_1 = __importDefault(require("./routes/exercises"));
const workouts_1 = __importDefault(require("./routes/workouts"));
const workoutLogs_1 = __importDefault(require("./routes/workoutLogs")); // Add this
const events_1 = __importDefault(require("./routes/events")); // Lazy to import here
const app = (0, express_1.default)();
const multer = require("multer");
const allowedOrigins = [
    "http://localhost:3000",
    "https://fit-forge-drab.vercel.app",
    "http://192.168.0.11:4000",
];
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
};
app.use((0, cors_1.default)(corsOptions));
// Preflight for all routes (regex instead of "*")
app.options(/.*/, (0, cors_1.default)(corsOptions));
app.use((0, morgan_1.default)("dev"));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// health check
app.get("/health", (_req, res) => res.json({ ok: true }));
// routes
app.use("/auth", auth_1.default);
const requireAuth_1 = require("./middleware/requireAuth");
app.get("/whoami", requireAuth_1.requireAuth, (req, res) => {
    res.json({ userId: req.user.userId });
});
app.use("/exercises", exercises_1.default);
app.use("/workouts", workouts_1.default);
app.use("/workoutLogs", workoutLogs_1.default); // Add this
app.use("/events", events_1.default); // Lazy to import here
// error handler
app.use((err, _req, res, _next) => {
    if (err.name === "ZodError") {
        return res.status(400).json({
            error: "ZOD_ERROR",
            message: err.errors?.[0]?.message ?? "Invalid input",
            details: err.errors,
        });
    }
    if (err instanceof ApiError_1.ApiError) {
        return res
            .status(err.status)
            .json({ error: err.code, message: err.message });
    }
    console.error(err);
    res.status(500).json({ error: "INTERNAL", message: "Server error" });
});
// start
(async () => {
    await mongoose_1.default.connect(env_1.env.MONGODB_URI);
    console.log("Mongo connected");
    app.listen(env_1.env.PORT, () => console.log(`API listening on http://localhost:${env_1.env.PORT}`));
})();

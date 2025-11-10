"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(status, code, message) {
        super(message);
        this.status = status;
        this.code = code;
    }
}
exports.ApiError = ApiError;
exports.errors = {
    validation: (msg = "Validation failed") => new ApiError(400, "VALIDATION_FAILED", msg),
    authRequired: () => new ApiError(401, "AUTH_REQUIRED", "Authentication required"),
    authInvalid: () => new ApiError(401, "AUTH_INVALID", "Invalid credentials"),
    conflict: (msg = "Conflict") => new ApiError(409, "CONFLICT", msg),
    notFound: (msg = "Not found") => new ApiError(404, "NOT_FOUND", msg),
};

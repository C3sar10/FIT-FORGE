export class ApiError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const errors = {
  validation: (msg = "Validation failed") =>
    new ApiError(400, "VALIDATION_FAILED", msg),
  authRequired: () =>
    new ApiError(401, "AUTH_REQUIRED", "Authentication required"),
  authInvalid: () => new ApiError(401, "AUTH_INVALID", "Invalid credentials"),
  conflict: (msg = "Conflict") => new ApiError(409, "CONFLICT", msg),
  notFound: (msg = "Not found") => new ApiError(404, "NOT_FOUND", msg),
};

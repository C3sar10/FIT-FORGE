"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
const jwt_1 = require("../lib/jwt");
const ApiError_1 = require("../utils/ApiError");
function requireAuth(req, _res, next) {
    let token = req.headers.authorization?.startsWith("Bearer ")
        ? req.headers.authorization.split(" ")[1]
        : req.cookies?.["ff_access"];
    if (!token)
        throw ApiError_1.errors.authRequired();
    try {
        const payload = (0, jwt_1.verifyAccess)(token);
        req.user = { userId: payload.sub };
        next();
    }
    catch {
        throw ApiError_1.errors.authInvalid();
    }
}

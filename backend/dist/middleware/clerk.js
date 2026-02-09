"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clerkMiddleware = void 0;
const clerk_sdk_node_1 = require("@clerk/clerk-sdk-node");
// Middleware to authenticate requests using Clerk
exports.clerkMiddleware = (0, clerk_sdk_node_1.ClerkExpressWithAuth)({
// Optional: Add configuration here if needed, 
// but it should auto-pick from CLERK_SECRET_KEY in .env
});

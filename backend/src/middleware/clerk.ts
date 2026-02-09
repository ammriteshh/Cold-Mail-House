import { ClerkExpressWithAuth } from '@clerk/clerk-sdk-node';

// Middleware to authenticate requests using Clerk
export const clerkMiddleware = ClerkExpressWithAuth({
    // Optional: Add configuration here if needed, 
    // but it should auto-pick from CLERK_SECRET_KEY in .env
});

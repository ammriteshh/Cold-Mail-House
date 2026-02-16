"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = require("../db/prisma");
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma_1.prisma.user.findUnique({ where: { id } });
        done(null, user);
    }
    catch (error) {
        done(error, null);
    }
});
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
    passReqToCallback: true,
}, async (req, accessToken, refreshToken, profile, done) => {
    try {
        // 1. Check if user exists by Google ID
        const existingUser = await prisma_1.prisma.user.findUnique({
            where: { googleId: profile.id },
        });
        if (existingUser) {
            return done(null, existingUser);
        }
        // 2. Check if user exists by Email (link account)
        if (profile.emails && profile.emails.length > 0) {
            const existingEmailUser = await prisma_1.prisma.user.findUnique({
                where: { email: profile.emails[0].value },
            });
            if (existingEmailUser) {
                // Link Google ID to existing user
                const user = await prisma_1.prisma.user.update({
                    where: { id: existingEmailUser.id },
                    data: { googleId: profile.id, avatar: profile.photos?.[0]?.value, authProvider: 'google' },
                });
                return done(null, user);
            }
            // 3. Create new user
            const newUser = await prisma_1.prisma.user.create({
                data: {
                    googleId: profile.id,
                    email: profile.emails[0].value,
                    name: profile.displayName,
                    avatar: profile.photos?.[0]?.value,
                    authProvider: 'google',
                    role: 'user', // Default role
                },
            });
            return done(null, newUser);
        }
        return done(new Error("No email found in profile"), undefined);
    }
    catch (error) {
        return done(error, undefined);
    }
}));

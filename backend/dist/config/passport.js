"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const passport_1 = __importDefault(require("passport"));
const passport_google_oauth20_1 = require("passport-google-oauth20");
const prisma_1 = require("../db/prisma");
passport_1.default.use(
// @ts-ignore
new passport_google_oauth20_1.Strategy({
    clientID: process.env.GOOGLE_CLIENT_ID || '',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    callbackURL: `${process.env.VITE_API_URL}/auth/google/callback`, // Needs full URL
}, async (accessToken, refreshToken, profile, done) => {
    try {
        const { id, displayName, emails, photos } = profile;
        const email = emails?.[0]?.value;
        if (!email) {
            return done(new Error('No email found from Google'), undefined);
        }
        // Upsert User
        const user = await prisma_1.prisma.user.upsert({
            where: { googleId: id },
            update: {
                name: displayName,
                avatar: photos?.[0]?.value,
            },
            create: {
                googleId: id,
                email,
                name: displayName,
                avatar: photos?.[0]?.value,
            },
        });
        return done(null, user);
    }
    catch (error) {
        return done(error, undefined);
    }
}));
exports.default = passport_1.default;

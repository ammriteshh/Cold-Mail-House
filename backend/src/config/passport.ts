
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../db/prisma';
import { config } from '../config';

passport.serializeUser((user: any, done) => {
    console.log("✅ [DEBUG] Serializing User:", user.id);
    console.log("   - Session ID should be set now.");
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        console.log("✅ [DEBUG] Deserializing User ID:", id);
        const user = await prisma.user.findUnique({ where: { id } });
        if (user) {
            console.log("   - User found in DB for session.");
            done(null, user);
        } else {
            console.warn("   ⚠️ User NOT found in DB for session ID:", id);
            done(null, null);
        }
    } catch (error) {
        console.error("❌ [DEBUG] Deserialize Error:", error);
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: `${process.env.API_URL || 'http://localhost:3000'}/auth/google/callback`,
            passReqToCallback: true,
        },
        async (req: any, accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
            console.log("✅ [DEBUG] Google Strategy Callback");
            console.log("   - Profile ID:", profile.id);
            console.log("   - Email:", profile.emails?.[0]?.value);
            try {
                // 1. Check if user exists by Google ID
                const existingUser = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                });

                if (existingUser) {
                    console.log("   - User found by Google ID:", existingUser.id);
                    return done(null, existingUser);
                }

                // 2. Check if user exists by Email (link account)
                if (profile.emails && profile.emails.length > 0) {
                    const existingEmailUser = await prisma.user.findUnique({
                        where: { email: profile.emails[0].value },
                    });

                    if (existingEmailUser) {
                        console.log("   - User found by Email, linking account:", existingEmailUser.id);
                        // Link Google ID to existing user
                        const user = await prisma.user.update({
                            where: { id: existingEmailUser.id },
                            data: { googleId: profile.id, avatar: profile.photos?.[0]?.value, authProvider: 'google' },
                        });
                        return done(null, user);
                    }

                    // 3. Create new user
                    console.log("   - Creating new user");
                    const newUser = await prisma.user.create({
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

            } catch (error) {
                console.error("❌ [DEBUG] Google Strategy Error:", error);
                return done(error, undefined);
            }
        }
    )
);

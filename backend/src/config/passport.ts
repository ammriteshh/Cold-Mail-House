
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../db/prisma';
import { config } from '../config';

passport.serializeUser((user: any, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
    try {
        const user = await prisma.user.findUnique({ where: { id } });
        done(null, user);
    } catch (error) {
        done(error, null);
    }
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
            passReqToCallback: true,
        },
        async (req: any, accessToken: string, refreshToken: string, profile: any, done: (error: any, user?: any) => void) => {
            try {
                // 1. Check if user exists by Google ID
                const existingUser = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                });

                if (existingUser) {
                    return done(null, existingUser);
                }

                // 2. Check if user exists by Email (link account)
                if (profile.emails && profile.emails.length > 0) {
                    const existingEmailUser = await prisma.user.findUnique({
                        where: { email: profile.emails[0].value },
                    });

                    if (existingEmailUser) {
                        // Link Google ID to existing user
                        const user = await prisma.user.update({
                            where: { id: existingEmailUser.id },
                            data: { googleId: profile.id, avatar: profile.photos?.[0]?.value, authProvider: 'google' },
                        });
                        return done(null, user);
                    }

                    // 3. Create new user
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
                return done(error, undefined);
            }
        }
    )
);

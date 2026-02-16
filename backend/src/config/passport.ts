
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
<<<<<<< HEAD
            callbackURL: '/auth/google/callback', // Relative or absolute URL
=======
            callbackURL: process.env.GOOGLE_CALLBACK_URL!,
>>>>>>> 98bf376c254248ade89c2380a2f6378fb6947079
            passReqToCallback: true,
        },
        async (req, accessToken, refreshToken, profile, done) => {
            try {
                // 1. Check if user exists by Google ID
                const existingUser = await prisma.user.findUnique({
                    where: { googleId: profile.id },
                });

                if (existingUser) {
                    return done(null, existingUser);
                }

                // 2. Check if user exists by Email (link account)
                const existingEmailUser = await prisma.user.findUnique({
                    where: { email: profile.emails![0].value },
                });

                if (existingEmailUser) {
                    // Link Google ID to existing user
                    const user = await prisma.user.update({
                        where: { id: existingEmailUser.id },
<<<<<<< HEAD
                        data: { googleId: profile.id, avatar: profile.photos?.[0]?.value },
=======
                        data: { googleId: profile.id, avatar: profile.photos?.[0]?.value, authProvider: 'google' },
>>>>>>> 98bf376c254248ade89c2380a2f6378fb6947079
                    });
                    return done(null, user);
                }

                // 3. Create new user
                const newUser = await prisma.user.create({
                    data: {
                        googleId: profile.id,
                        email: profile.emails![0].value,
                        name: profile.displayName,
                        avatar: profile.photos?.[0]?.value,
<<<<<<< HEAD
=======
                        authProvider: 'google',
>>>>>>> 98bf376c254248ade89c2380a2f6378fb6947079
                        role: 'user', // Default role
                    },
                });

                done(null, newUser);
            } catch (error) {
                done(error, undefined);
            }
        }
    )
);

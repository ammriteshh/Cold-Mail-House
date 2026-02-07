import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { prisma } from '../db/prisma';
import { config } from '../config';

passport.use(
    // @ts-ignore
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
            callbackURL: process.env.GOOGLE_CALLBACK_URL || `${process.env.API_URL || (process.env.NODE_ENV === 'production' ? 'https://cold-mail-house.onrender.com' : 'http://localhost:3000')}/auth/google/callback`,
        },
        async (accessToken: any, refreshToken: any, profile: any, done: any) => {
            try {
                const { id, displayName, emails, photos } = profile;
                const email = emails?.[0]?.value;

                if (!email) {
                    return done(new Error('No email found from Google'), undefined);
                }

                // Upsert User
                const user = await prisma.user.upsert({
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
            } catch (error) {
                return done(error as any, undefined);
            }
        }
    ) as any
);

export default passport;

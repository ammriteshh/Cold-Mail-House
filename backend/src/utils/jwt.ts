import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRY = process.env.ACCESS_TOKEN_EXPIRY || '15m';
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || '7d';

interface TokenPayload {
    userId: string;
    role: string;
}

export const generateAccessToken = (userId: string, role: string): string => {
    return jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] });
};

export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] });
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
};

export const verifyRefreshToken = (token: string): { userId: string } | null => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
    } catch (error) {
        return null;
    }
};

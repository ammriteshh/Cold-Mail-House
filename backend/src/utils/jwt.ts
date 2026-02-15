import jwt, { SignOptions } from 'jsonwebtoken';

// Environment variables for JWT
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET!;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET!;
const ACCESS_TOKEN_EXPIRY = (process.env.ACCESS_TOKEN_EXPIRY || '15m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRY = (process.env.REFRESH_TOKEN_EXPIRY || '7d') as SignOptions['expiresIn'];

interface TokenPayload {
    userId: string;
    role?: string; // Made generic/optional if needed, but keeping consistent with usage
}

/**
 * Generates an access token for a user.
 * @param {string} userId - User's ID
 * @param {string} role - User's role
 * @returns {string} - Signed JWT access token
 */
export const generateAccessToken = (userId: string, role: string): string => {
    return jwt.sign({ userId, role }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
};

/**
 * Generates a refresh token for a user.
 * @param {string} userId - User's ID
 * @returns {string} - Signed JWT refresh token
 */
export const generateRefreshToken = (userId: string): string => {
    return jwt.sign({ userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
};

/**
 * Verifies an access token.
 * @param {string} token - The JWT string
 * @returns {TokenPayload | null} - Decoded payload or null if invalid
 */
export const verifyAccessToken = (token: string): TokenPayload | null => {
    try {
        return jwt.verify(token, ACCESS_TOKEN_SECRET) as TokenPayload;
    } catch (error) {
        return null;
    }
};

/**
 * Verifies a refresh token.
 * @param {string} token - The JWT string
 * @returns {{ userId: string } | null} - Decoded payload or null if invalid
 */
export const verifyRefreshToken = (token: string): { userId: string } | null => {
    try {
        return jwt.verify(token, REFRESH_TOKEN_SECRET) as { userId: string };
    } catch (error) {
        return null;
    }
};

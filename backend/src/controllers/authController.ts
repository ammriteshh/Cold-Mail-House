import { Request, Response } from 'express';
import { prisma } from '../db/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ error: 'User already exists' });
        }

        const hashedPassword = await hashPassword(password);
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error: any) {
        console.error('Registration failed:', error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await comparePassword(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const accessToken = generateAccessToken(user.id, user.role);
        const refreshToken = generateRefreshToken(user.id);

        await prisma.user.update({
            where: { id: user.id },
            data: { refreshToken }
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // Must be 'none' for cross-site cookie
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        res.json({ accessToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
        console.error('Login failed:', error);
        res.status(500).json({ error: 'Login failed' });
    }
};

export const refresh = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) return res.status(401).json({ error: 'No refresh token' });

        const payload = verifyRefreshToken(refreshToken);
        if (!payload) return res.status(403).json({ error: 'Invalid refresh token' });

        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user || user.refreshToken !== refreshToken) {
            return res.status(403).json({ error: 'Invalid refresh token' });
        }

        const newAccessToken = generateAccessToken(user.id, user.role);
        res.json({ accessToken: newAccessToken });
    } catch (error) {
        console.error('Refresh failed:', error);
        res.status(500).json({ error: 'Refresh failed' });
    }
};

export const logout = async (req: Request, res: Response) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (refreshToken) {
            const payload = verifyRefreshToken(refreshToken);
            if (payload) {
                await prisma.user.update({
                    where: { id: payload.userId },
                    data: { refreshToken: null }
                });
            }
        }

        res.clearCookie('refreshToken');
        res.json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Logout failed:', error);
        res.status(500).json({ error: 'Logout failed' });
    }
};

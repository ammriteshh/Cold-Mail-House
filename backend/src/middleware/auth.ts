import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/prisma';

interface AuthRequest extends Request {
    user?: any; // Customize with User type if available
}

export const authenticateJWT = async (req: any, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>

        jwt.verify(token, process.env.JWT_SECRET || 'secret', async (err: any, decoded: any) => {
            if (err) {
                return res.sendStatus(403);
            }

            // Optional: Fetch user from DB to ensure validity
            try {
                const user = await prisma.user.findUnique({ where: { id: (decoded as any).userId } });
                if (!user) {
                    return res.sendStatus(403);
                }
                req.user = user;
                next();
            } catch (error) {
                return res.sendStatus(500);
            }
        });
    } else {
        res.sendStatus(401);
    }
};

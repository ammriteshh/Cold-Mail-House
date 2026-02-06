"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = require("../db/prisma");
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(' ')[1]; // Bearer <token>
        jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'secret', async (err, decoded) => {
            if (err) {
                return res.sendStatus(403);
            }
            // Optional: Fetch user from DB to ensure validity
            try {
                const user = await prisma_1.prisma.user.findUnique({ where: { id: decoded.userId } });
                if (!user) {
                    return res.sendStatus(403);
                }
                req.user = user;
                next();
            }
            catch (error) {
                return res.sendStatus(500);
            }
        });
    }
    else {
        res.sendStatus(401);
    }
};
exports.authenticateJWT = authenticateJWT;

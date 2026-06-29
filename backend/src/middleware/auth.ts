import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from '../lib/errors';

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        email?: string;
    };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next(new UnauthorizedError('Access token required'));
    }

    jwt.verify(token, (process.env.JWT_SECRET || 'fallback_secret') as string, (err: any, user: any) => {
        if (err) {
            return next(new ForbiddenError('Invalid or expired token'));
        }
        req.user = user as { id: string; role: string; email?: string };
        next();
    });
};

export const authenticateTokenOptional = (req: AuthRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return next();
    }

    jwt.verify(token, (process.env.JWT_SECRET || 'fallback_secret') as string, (err: any, user: any) => {
        if (!err && user) {
            req.user = user as { id: string; role: string; email?: string };
        }
        next();
    });
};

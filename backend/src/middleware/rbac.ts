import { Response, NextFunction } from 'express';
import { AuthRequest } from './auth';
import { ForbiddenError, UnauthorizedError } from '../lib/errors';

export const requireRole = (...roles: string[]) => {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        if (!req.user) {
            return next(new UnauthorizedError('Authentication required'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError('You do not have permission to perform this action'));
        }

        next();
    };
};

export default requireRole;

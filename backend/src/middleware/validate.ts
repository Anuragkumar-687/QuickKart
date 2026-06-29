import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../lib/errors';

export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const parsed = await schema.parseAsync(req[source]);
            req[source] = parsed;
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const message = error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
                next(new ValidationError(message));
            } else {
                next(error);
            }
        }
    };
};

export default validate;

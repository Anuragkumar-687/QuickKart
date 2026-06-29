import { Request, Response, NextFunction } from 'express';
import { AppError } from '../lib/errors';
import { Prisma } from '@prisma/client';

export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    // Log the error for internal tracking
    console.error(`[Error] ${req.method} ${req.url}:`, err);

    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;

    // Handle our custom AppError classes
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({
            status: 'error',
            message: err.message,
            ...(isDev && { stack: err.stack }),
        });
    }

    // Handle Prisma Database Errors
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
        // Unique constraint violation
        if (err.code === 'P2002') {
            const target = (err.meta?.target as string[]) || [];
            return res.status(409).json({
                status: 'error',
                message: `Duplicate field value: ${target.join(', ')}`,
                code: err.code,
            });
        }

        // Record not found
        if (err.code === 'P2025') {
            return res.status(404).json({
                status: 'error',
                message: 'Resource not found',
                code: err.code,
            });
        }

        // Other known Prisma errors
        return res.status(400).json({
            status: 'error',
            message: `Database error: ${err.message}`,
            code: err.code,
        });
    }

    // Fallback for unhandled/internal server errors
    return res.status(500).json({
        status: 'error',
        message: isDev ? err.message : 'Internal Server Error',
        ...(isDev && { stack: err.stack }),
    });
};

export default errorHandler;

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../lib/prisma';

export const getRecentlyViewed = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const userId = req.user!.id;

        const items = await prisma.recentlyViewed.findMany({
            where: { userId },
            orderBy: { viewedAt: 'desc' },
            take: 20,
            include: {
                product: true
            }
        });

        // Map to return products directly
        const products = items.map(item => item.product);
        res.json(products);
    } catch (error) {
        next(error);
    }
};

export default { getRecentlyViewed };

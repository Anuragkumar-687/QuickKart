import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import ingestionService from '../services/ingestionService';

export const triggerIngest = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        console.log('Admin triggered product ingestion...');
        const result = await ingestionService.syncProducts();
        res.json({
            message: 'Products ingested successfully',
            ...result
        });
    } catch (error) {
        next(error);
    }
};

export default { triggerIngest };

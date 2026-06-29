import prisma from '../lib/prisma';

export const analyticsService = {
    async trackEvent(productId: string, userId: string | null, eventType: string, metadata?: any) {
        try {
            const event = await prisma.productEvent.create({
                data: {
                    productId,
                    userId,
                    eventType,
                    metadata: metadata ? JSON.stringify(metadata) : null,
                },
            });
            return event;
        } catch (error) {
            console.error('Failed to track event:', error);
        }
    },

    async updateRegionPopularity(productId: string, region: string) {
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                select: { regionPopularity: true },
            });

            if (!product) return;

            let popularity: Record<string, number> = {};
            if (product.regionPopularity) {
                try {
                    popularity = typeof product.regionPopularity === 'string'
                        ? JSON.parse(product.regionPopularity)
                        : (product.regionPopularity as Record<string, number>);
                } catch {
                    popularity = {};
                }
            }

            popularity[region] = (popularity[region] || 0) + 1;

            await prisma.product.update({
                where: { id: productId },
                data: {
                    regionPopularity: popularity,
                },
            });
        } catch (error) {
            console.error('Failed to update region popularity:', error);
        }
    }
};

export default analyticsService;

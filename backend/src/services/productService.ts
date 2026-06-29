import prisma from '../lib/prisma';
import analyticsService from './analyticsService';

export interface ProductQueryFilters {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    sort?: string;
}

export const productService = {
    async getProducts(filters: ProductQueryFilters) {
        const page = Math.max(1, filters.page || 1);
        const limit = Math.max(1, Math.min(100, filters.limit || 20));
        const skip = (page - 1) * limit;

        const where: any = {};

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        if (filters.category && filters.category !== 'All' && filters.category !== 'All Categories') {
            where.category = { equals: filters.category, mode: 'insensitive' };
        }

        let orderBy: any = { createdAt: 'desc' }; // default newest
        if (filters.sort) {
            switch (filters.sort) {
                case 'price_asc':
                case 'Price: Low to High':
                    orderBy = { price: 'asc' };
                    break;
                case 'price_desc':
                case 'Price: High to Low':
                    orderBy = { price: 'desc' };
                    break;
                case 'rating_desc':
                    orderBy = { rating: 'desc' };
                    break;
                case 'newest':
                case 'New In':
                    orderBy = { createdAt: 'desc' };
                    break;
                case 'popular':
                case 'Most Popular':
                    orderBy = { viewCount: 'desc' };
                    break;
                default:
                    orderBy = { createdAt: 'desc' };
            }
        }

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                skip,
                take: limit,
                orderBy,
            }),
            prisma.product.count({ where }),
        ]);

        // Get unique categories list for filter dropdown
        const categoriesRaw = await prisma.product.findMany({
            select: { category: true },
            distinct: ['category'],
        });
        const categories = categoriesRaw.map(c => c.category);

        return {
            products,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
            categories,
        };
    },

    async getProductById(id: string) {
        return prisma.product.findUnique({
            where: { id },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    },
                    orderBy: {
                        createdAt: 'desc'
                    }
                }
            }
        });
    },

    async createProduct(data: {
        name: string;
        description: string;
        price: number;
        category: string;
        image: string;
        stock: number;
        source?: string;
        sourceId?: string;
        rating?: number;
    }) {
        return prisma.product.create({
            data: {
                ...data,
                source: data.source || 'manual',
            },
        });
    },

    async updateProduct(id: string, data: Partial<{
        name: string;
        description: string;
        price: number;
        category: string;
        image: string;
        stock: number;
        rating: number;
    }>) {
        return prisma.product.update({
            where: { id },
            data,
        });
    },

    async deleteProduct(id: string) {
        return prisma.product.delete({
            where: { id },
        });
    },

    async incrementViewCount(id: string, userId: string | null, region?: string) {
        try {
            const product = await prisma.product.update({
                where: { id },
                data: {
                    viewCount: { increment: 1 }
                }
            });

            // Fire view event
            await analyticsService.trackEvent(id, userId, 'view', { region });

            // If region provided, increment region-based popularity
            if (region) {
                await analyticsService.updateRegionPopularity(id, region);
            }

            return product;
        } catch (error) {
            console.error('Failed to increment view count:', error);
            // return product without incrementing if error
            return prisma.product.findUnique({ where: { id } });
        }
    },

    async incrementPurchaseCount(id: string, quantity: number) {
        return prisma.product.update({
            where: { id },
            data: {
                purchaseCount: { increment: quantity }
            }
        });
    }
};

export default productService;

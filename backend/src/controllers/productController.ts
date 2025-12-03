import { Request, Response } from 'express';
import { prisma } from '../server';

export const getProducts = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 12;
        const skip = (page - 1) * limit;

        console.log(`Fetching products - Page: ${page}, Limit: ${limit}`);

        const [products, total] = await Promise.all([
            prisma.product.findMany({
                skip,
                take: limit,
            }),
            prisma.product.count(),
        ]);

        console.log(`Fetched ${products.length} products`);

        res.json({
            products,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            totalProducts: total
        });
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ message: 'Error fetching products', error });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.findUnique({ where: { id } });
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const product = await prisma.product.create({
            data: req.body,
        });
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const product = await prisma.product.update({
            where: { id },
            data: req.body,
        });
        res.json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error updating product', error });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.product.delete({ where: { id } });
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting product', error });
    }
};

import { z } from 'zod';

export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const productCreateSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().min(1, 'Description is required'),
    price: z.number().positive('Price must be greater than 0'),
    category: z.string().min(1, 'Category is required'),
    image: z.string().url('Image must be a valid URL').or(z.string().min(1, 'Image path is required')),
    stock: z.number().int().nonnegative('Stock cannot be negative'),
});

export const productUpdateSchema = productCreateSchema.partial();

export const addToCartSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateCartItemSchema = z.object({
    quantity: z.number().int().min(1, 'Quantity must be at least 1'),
});

export const productQuerySchema = z.object({
    page: z.preprocess((val) => Number(val), z.number().int().positive()).optional(),
    limit: z.preprocess((val) => Number(val), z.number().int().positive()).optional(),
    search: z.string().optional(),
    category: z.string().optional(),
    sort: z.string().optional(),
});

export const reviewCreateSchema = z.object({
    rating: z.number().int().min(1, 'Rating must be at least 1').max(5, 'Rating cannot exceed 5'),
    comment: z.string().min(1, 'Comment cannot be empty'),
});

export const addToWishlistSchema = z.object({
    productId: z.string().min(1, 'Product ID is required'),
});

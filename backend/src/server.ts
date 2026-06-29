import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './lib/prisma';
import errorHandler from './middleware/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
const allowedOrigins = [
    'http://localhost:3000',
    'https://ecommercee-webiste.vercel.app'
];

app.use(cors({
    origin: (origin, callback) => {
        console.log('Request Origin:', origin);

        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
            callback(null, true);
        } else {
            console.log('Blocked by CORS:', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express.json());

// Global request logger (removed verbose req.body print for security)
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Basic health check
app.get('/', (req, res) => {
    res.send('QuickKart API is running');
});

import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import reviewRoutes from './routes/reviews';
import wishlistRoutes from './routes/wishlist';
import ingestionRoutes from './routes/ingestion';
import recentlyViewedRoutes from './routes/recentlyViewed';

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/admin/ingest', ingestionRoutes);
app.use('/api/recently-viewed', recentlyViewedRoutes);

// Register centralized error handler as the last middleware
app.use(errorHandler);

app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});

export { prisma };

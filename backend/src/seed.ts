import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import ingestionService from './services/ingestionService';

dotenv.config();

async function seed() {
    try {
        console.log('Connecting to database...');
        // Test connection
        await prisma.$connect();
        console.log('Connected!');

        console.log('Clearing existing data...');
        await prisma.productEvent.deleteMany({});
        await prisma.recentlyViewed.deleteMany({});
        await prisma.review.deleteMany({});
        await prisma.wishlistItem.deleteMany({});
        await prisma.wishlist.deleteMany({});
        await prisma.orderItem.deleteMany({});
        await prisma.cartItem.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.cart.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('Data cleared!');

        console.log('Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        // We create them one by one because createMany might behave differently in MongoDB
        const adminUser = await prisma.user.create({
            data: {
                name: 'Admin User',
                email: 'admin@quickkart.com',
                password: hashedPassword,
                role: 'admin',
            }
        });

        const demoUser = await prisma.user.create({
            data: {
                name: 'Demo User',
                email: 'user@quickkart.com',
                password: hashedPassword,
                role: 'user',
            }
        });

        console.log('Users created: admin@quickkart.com, user@quickkart.com (password123)');

        console.log('Ingesting products from external APIs...');
        const syncResult = await ingestionService.syncProducts();
        console.log(`Ingested successfully: Created ${syncResult.createdCount}, Updated ${syncResult.updatedCount}`);

        console.log('Successfully seeded database!');
        await prisma.$disconnect();
        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

seed();

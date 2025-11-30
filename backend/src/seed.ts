import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const categories = ['Electronics', 'Fashion', 'Home', 'Sports', 'Books', 'Beauty'];
const productTypes: any = {
    Electronics: ['Laptop', 'Smartphone', 'Headphones', 'Camera', 'Tablet', 'Smartwatch', 'Monitor'],
    Fashion: ['T-Shirt', 'Jeans', 'Sneakers', 'Jacket', 'Dress', 'Watch', 'Sunglasses'],
    Home: ['Sofa', 'Lamp', 'Rug', 'Chair', 'Table', 'Cushion', 'Vase'],
    Sports: ['Yoga Mat', 'Dumbbell', 'Running Shoes', 'Bicycle', 'Tennis Racket', 'Basketball'],
    Books: ['Novel', 'Textbook', 'Magazine', 'Comic Book', 'Cookbook', 'Biography'],
    Beauty: ['Lipstick', 'Perfume', 'Face Cream', 'Shampoo', 'Nail Polish', 'Mascara'],
};

const adjectives = ['Premium', 'Luxury', 'Modern', 'Classic', 'Elegant', 'Stylish', 'Professional', 'Comfortable'];

const productImages: { [key: string]: string } = {
    'Laptop': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80',
    'Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80',
    'Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    'Camera': 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    'Tablet': 'https://images.unsplash.com/photo-1561154464-82e9adf32764?w=800&q=80',
    'Smartwatch': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    'Monitor': 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80',
    'T-Shirt': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80',
    'Jeans': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800&q=80',
    'Sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'Jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80',
    'Dress': 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&q=80',
    'Watch': 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&q=80',
    'Sunglasses': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=800&q=80',
    'Sofa': 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80',
    'Lamp': 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    'Rug': 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&q=80',
    'Chair': 'https://images.unsplash.com/photo-1517705008128-361805f42e86?w=800&q=80',
    'Table': 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=800&q=80',
    'Cushion': 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=800&q=80',
    'Vase': 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=800&q=80',
    'Yoga Mat': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80',
    'Dumbbell': 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80',
    'Running Shoes': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&q=80',
    'Bicycle': 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800&q=80',
    'Tennis Racket': 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80',
    'Basketball': 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80',
    'Novel': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
    'Textbook': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80',
    'Magazine': 'https://images.unsplash.com/photo-1603484477859-abe6a73f9366?w=800&q=80',
    'Comic Book': 'https://images.unsplash.com/photo-1612036782180-6f0b6cd846fe?w=800&q=80',
    'Cookbook': 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=800&q=80',
    'Biography': 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
    'Lipstick': 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80',
    'Perfume': 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&q=80',
    'Face Cream': 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    'Shampoo': 'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?w=800&q=80',
    'Nail Polish': 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&q=80',
    'Mascara': 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800&q=80',
};

function generateProducts(count: number) {
    const products = [];
    for (let i = 0; i < count; i++) {
        const category = categories[Math.floor(Math.random() * categories.length)];
        const typeList = productTypes[category];
        const type = typeList[Math.floor(Math.random() * typeList.length)];
        const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
        const productImage = productImages[type] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80';

        products.push({
            name: `${adjective} ${type}`,
            description: `This is a high-quality ${type.toLowerCase()} perfect for your daily needs. It features a ${adjective.toLowerCase()} design and durable construction.`,
            price: parseFloat((Math.random() * 200 + 10).toFixed(2)),
            category,
            image: productImage,
            stock: Math.floor(Math.random() * 100),
        });
    }
    return products;
}

async function seed() {
    try {
        console.log('Connecting to database...');
        console.log('Connected!');

        console.log('Clearing existing data...');
        await prisma.orderItem.deleteMany({});
        await prisma.cartItem.deleteMany({});
        await prisma.order.deleteMany({});
        await prisma.cart.deleteMany({});
        await prisma.product.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('Data cleared!');

        console.log('Creating users...');
        const hashedPassword = await bcrypt.hash('password123', 10);

        await prisma.user.createMany({
            data: [
                {
                    name: 'Admin User',
                    email: 'admin@quickkart.com',
                    password: hashedPassword,
                    role: 'admin',
                },
                {
                    name: 'Demo User',
                    email: 'user@quickkart.com',
                    password: hashedPassword,
                    role: 'user',
                },
            ],
        });
        console.log('Users created: admin@quickkart.com, user@quickkart.com (password123)');

        console.log('Generating products...');
        const products = generateProducts(40);

        console.log('Inserting products...');
        await prisma.product.createMany({ data: products });

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

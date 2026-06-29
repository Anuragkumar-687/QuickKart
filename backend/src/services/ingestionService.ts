import prisma from '../lib/prisma';

export interface NormalizedProduct {
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    rating: number;
    stock: number;
    source: string;
    sourceId: string;
}

export const ingestionService = {
    async fetchFromDummyJSON(): Promise<NormalizedProduct[]> {
        try {
            console.log('Fetching products from DummyJSON...');
            const response = await fetch('https://dummyjson.com/products?limit=100');
            if (!response.ok) {
                throw new Error(`DummyJSON API error: ${response.statusText}`);
            }
            const data = await response.json();
            const rawProducts = data.products || [];

            return rawProducts.map((p: any) => ({
                name: p.title,
                description: p.description || '',
                price: Number(p.price) || 0,
                category: p.category || 'general',
                image: p.thumbnail || (p.images && p.images[0]) || '',
                rating: Number(p.rating) || 0,
                stock: Number(p.stock) || 0,
                source: 'dummyjson',
                sourceId: String(p.id),
            }));
        } catch (error) {
            console.error('Error fetching from DummyJSON:', error);
            return [];
        }
    },

    async fetchFromFakeStore(): Promise<NormalizedProduct[]> {
        try {
            console.log('Fetching products from FakeStore API...');
            const response = await fetch('https://fakestoreapi.com/products');
            if (!response.ok) {
                throw new Error(`FakeStore API error: ${response.statusText}`);
            }
            const rawProducts = await response.json();

            return rawProducts.map((p: any) => ({
                name: p.title,
                description: p.description || '',
                price: Number(p.price) || 0,
                category: p.category || 'general',
                image: p.image || '',
                rating: p.rating ? Number(p.rating.rate) : 0,
                stock: p.rating ? Number(p.rating.count) : 50,
                source: 'fakestore',
                sourceId: String(p.id),
            }));
        } catch (error) {
            console.error('Error fetching from FakeStore:', error);
            return [];
        }
    },

    async syncProducts() {
        console.log('Starting product sync process...');
        const [dummyJsonProducts, fakeStoreProducts] = await Promise.all([
            this.fetchFromDummyJSON(),
            this.fetchFromFakeStore()
        ]);

        const allProducts = [...dummyJsonProducts, ...fakeStoreProducts];
        console.log(`Fetched ${allProducts.length} total products to sync.`);

        let createdCount = 0;
        let updatedCount = 0;

        for (const item of allProducts) {
            try {
                // Check if product exists by source and sourceId
                const existing = await prisma.product.findFirst({
                    where: {
                        source: item.source,
                        sourceId: item.sourceId
                    }
                });

                if (existing) {
                    await prisma.product.update({
                        where: { id: existing.id },
                        data: {
                            name: item.name,
                            description: item.description,
                            price: item.price,
                            category: item.category,
                            image: item.image,
                            rating: item.rating,
                            stock: item.stock,
                            // preserve viewCount, purchaseCount, regionPopularity
                        }
                    });
                    updatedCount++;
                } else {
                    await prisma.product.create({
                        data: item
                    });
                    createdCount++;
                }
            } catch (err) {
                console.error(`Failed to sync product ${item.name} from ${item.source}:`, err);
            }
        }

        console.log(`Sync completed. Created: ${createdCount}, Updated: ${updatedCount}`);
        return { createdCount, updatedCount };
    }
};

export default ingestionService;

import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';

interface Product {
    id: string;
    _id?: string;
    name: string;
    price: number;
    image: string;
    category: string;
}

interface ProductCardProps {
    product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
    const { data: session } = useSession();
    const router = useRouter();

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.preventDefault();
        if (!session) {
            router.push('/login');
            return;
        }

        try {
            await api.post('/cart', {
                productId: product.id || product._id,
                quantity: 1,
            });
            alert('Added to cart!');
        } catch (error) {
            alert('Failed to add to cart');
        }
    };

    return (
        <div className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 border border-gray-100 cursor-pointer">
            <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="p-5">
                <div className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2 group-hover:text-purple-600 transition-colors duration-300">{product.category}</div>
                <Link href={`/products/${product._id}`}>
                    <h3 className="text-lg font-bold mb-3 text-gray-900 hover:text-blue-600 transition-colors duration-300 line-clamp-2 min-h-[3.5rem]">
                        {product.name}
                    </h3>
                </Link>
                <div className="flex justify-between items-center mt-4">
                    <span className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300">${product.price.toFixed(2)}</span>
                    <button
                        onClick={handleAddToCart}
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-5 py-2.5 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-md hover:shadow-xl text-sm font-semibold transform hover:scale-105 active:scale-95"
                    >
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    );
}

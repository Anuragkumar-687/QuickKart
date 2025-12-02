'use client';

import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function ProductDetailsPage() {
    const params = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${params.id}`);
                setProduct(res.data);
            } catch (err) {
                setError('Failed to load product');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    const { data: session } = useSession();
    const router = useRouter();

    const handleAddToCart = async () => {
        if (!session) {
            router.push('/login');
            return;
        }

        try {
            await api.post('/cart', {
                productId: product?._id,
                quantity: 1,
            });
            alert('Added to cart!');
            router.push('/cart');
        } catch (error) {
            alert('Failed to add to cart');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="text-center text-red-500 min-h-[50vh] flex items-center justify-center">
                {error || 'Product not found'}
            </div>
        );
    }

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="md:flex">
                <div className="md:w-1/2 relative h-96">
                    <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                    />
                </div>
                <div className="p-8 md:w-1/2">
                    <div className="uppercase tracking-wide text-sm text-indigo-500 font-semibold mb-2">
                        {product.category}
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
                    <p className="text-gray-600 mb-6">{product.description}</p>

                    <div className="flex items-center mb-6">
                        <span className="text-3xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                        <span className={`ml-4 px-3 py-1 rounded-full text-sm ${product.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                        </span>
                    </div>

                    <button
                        onClick={handleAddToCart}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
                        disabled={product.stock === 0}
                    >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                </div>
            </div>
        </div>
    );
}

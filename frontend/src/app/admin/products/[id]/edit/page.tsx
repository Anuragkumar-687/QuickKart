'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import ProductForm from '@/components/ProductForm';
import { useParams } from 'next/navigation';

interface Product {
    id?: string;
    _id?: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
    stock: number;
}

export default function EditProductPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await api.get(`/products/${params.id}`);
                setProduct(res.data);
            } catch (error) {
                console.error('Failed to fetch product');
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchProduct();
        }
    }, [params.id]);

    if (loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (!product) {
        return <div className="p-8 text-center text-red-500">Product not found</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Edit Product</h1>
            <ProductForm initialData={product} isEdit />
        </div>
    );
}

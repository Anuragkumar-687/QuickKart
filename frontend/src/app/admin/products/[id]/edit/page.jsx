'use client';

import { useState, useEffect } from 'react';
import api from '../../../../../lib/api';
import ProductForm from '../../../../../components/ProductForm';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditProductPage() {
    const params = useParams();
    const [product, setProduct] = useState(null);
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
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }

    if (!product) {
        return <div className="px-6 py-20 text-center text-danger">Product not found</div>;
    }

    return (
        <div className="mx-auto max-w-2xl px-6 py-10">
            <Link href="/admin" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Link>
            <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">Edit Product</h1>
            <ProductForm initialData={product} isEdit />
        </div>
    );
}

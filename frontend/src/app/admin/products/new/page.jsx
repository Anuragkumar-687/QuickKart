'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import ProductForm from '../../../../components/ProductForm';

export default function NewProductPage() {
    return (
        <div className="mx-auto max-w-2xl px-6 py-10">
            <Link href="/admin" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to dashboard
            </Link>
            <h1 className="mb-8 text-3xl font-bold tracking-tight text-foreground">Add New Product</h1>
            <ProductForm />
        </div>
    );
}

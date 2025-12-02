'use client';

import ProductForm from '../../../../components/ProductForm';

export default function NewProductPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Add New Product</h1>
            <ProductForm />
        </div>
    );
}

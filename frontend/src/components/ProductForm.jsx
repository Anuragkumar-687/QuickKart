'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../lib/api';

export default function ProductForm({ initialData, isEdit = false }) {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        category: '',
        image: '',
        stock: 0,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === 'price' || name === 'stock' ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isEdit && initialData?.id) {
                await api.put(`/products/${initialData.id}`, formData);
            } else {
                await api.post('/products', formData);
            }
            router.push('/admin');
            router.refresh();
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const label = 'mb-2 block text-sm font-medium text-foreground';

    return (
        <form onSubmit={handleSubmit} className="card mx-auto max-w-2xl space-y-5 p-6 sm:p-8">
            {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm font-medium text-danger">
                    {error}
                </div>
            )}

            <div>
                <label className={label}>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} className="input" required />
            </div>

            <div>
                <label className={label}>Description</label>
                <textarea name="description" value={formData.description} onChange={handleChange} className="input" rows={4} required />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className={label}>Price</label>
                    <input type="number" name="price" value={formData.price} onChange={handleChange} className="input" min="0" step="0.01" required />
                </div>
                <div>
                    <label className={label}>Stock</label>
                    <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="input" min="0" required />
                </div>
            </div>

            <div>
                <label className={label}>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleChange} className="input" required />
            </div>

            <div>
                <label className={label}>Image URL</label>
                <input type="url" name="image" value={formData.image} onChange={handleChange} className="input" required />
            </div>

            <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
                {loading ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
        </form>
    );
}

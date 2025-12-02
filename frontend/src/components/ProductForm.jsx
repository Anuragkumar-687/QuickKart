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
            if (isEdit && initialData?._id) {
                await api.put(`/products/${initialData._id}`, formData);
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

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            )}

            <div>
                <label className="block text-gray-700 mb-2">Name</label>
                <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-2">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    rows={4}
                    required
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-gray-700 mb-2">Price</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-700 mb-2">Stock</label>
                    <input
                        type="number"
                        name="stock"
                        value={formData.stock}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                        min="0"
                        required
                    />
                </div>
            </div>

            <div>
                <label className="block text-gray-700 mb-2">Category</label>
                <input
                    type="text"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                />
            </div>

            <div>
                <label className="block text-gray-700 mb-2">Image URL</label>
                <input
                    type="url"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                    required
                />
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
                {loading ? 'Saving...' : isEdit ? 'Update Product' : 'Create Product'}
            </button>
        </form>
    );
}

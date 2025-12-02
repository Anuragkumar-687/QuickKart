'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (session?.user?.role !== 'admin' && status === 'authenticated') {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                setProducts(res.data);
            } catch (error) {
                console.error('Failed to fetch products');
            } finally {
                setLoading(false);
            }
        };

        if (session?.user?.role === 'admin') {
            fetchProducts();
        }
    }, [session]);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            await api.delete(`/products/${id}`);
            setProducts(products.filter((p) => p._id !== id));
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    if (status === 'loading' || loading) {
        return <div className="p-8 text-center">Loading...</div>;
    }

    if (session?.user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Link
                    href="/admin/products/new"
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    Add New Product
                </Link>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {products.map((product, index) => (
                            <tr key={product._id || product.id || index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900">
                                        {product.name}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">
                                        ${product.price.toFixed(2)}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-gray-500">{product.stock}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <Link
                                        href={`/admin/products/${product._id}/edit`}
                                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                                    >
                                        Edit
                                    </Link>
                                    <button
                                        onClick={() => product._id && handleDelete(product._id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import api from '../../lib/api';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Pencil, Trash2, BarChart3 } from 'lucide-react';

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
                const res = await api.get('/products?limit=100&sort=newest');
                setProducts(res.data.data || []);
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
            setProducts(products.filter((p) => p.id !== id));
        } catch (error) {
            alert('Failed to delete product');
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="flex min-h-[40vh] items-center justify-center">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-border border-t-foreground" />
            </div>
        );
    }

    if (session?.user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="mx-auto max-w-7xl px-6 py-10">
            <div className="mb-8 flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{products.length} products in the catalogue</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href="/admin/analytics" className="btn btn-outline btn-md">
                        <BarChart3 className="h-4 w-4" /> Analytics
                    </Link>
                    <Link href="/admin/products/new" className="btn btn-primary btn-md">
                        <Plus className="h-4 w-4" /> Add Product
                    </Link>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-sm">
                        <thead>
                            <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                                <th className="px-6 py-4 font-medium">Product</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Stock</th>
                                <th className="px-6 py-4 text-right font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {products.map((product, index) => (
                                <tr key={product.id || index} className="transition-colors hover:bg-muted/50">
                                    <td className="px-6 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg border bg-muted">
                                                {product.image && (
                                                    <Image src={product.image} alt={product.name} fill className="object-cover" sizes="44px" />
                                                )}
                                            </div>
                                            <span className="line-clamp-1 max-w-xs font-medium text-foreground">{product.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 text-muted-foreground">{product.category}</td>
                                    <td className="px-6 py-3 font-medium text-foreground">${product.price.toFixed(2)}</td>
                                    <td className="px-6 py-3">
                                        <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${product.stock <= 5 ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-muted text-muted-foreground'}`}>
                                            {product.stock}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <Link href={`/admin/products/${product.id}/edit`} title="Edit" className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground">
                                                <Pencil className="h-4 w-4" />
                                            </Link>
                                            <button onClick={() => product.id && handleDelete(product.id)} title="Delete" className="grid h-9 w-9 place-items-center rounded-lg text-rose-500 hover:bg-rose-500/10">
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

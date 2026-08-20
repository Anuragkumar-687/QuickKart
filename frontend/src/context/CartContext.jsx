'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import api from '../lib/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { data: session } = useSession();
    const [cartCount, setCartCount] = useState(0);

    const itemsOf = (data) =>
        Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];

    // Total units, not line items — this has to agree with the cart page,
    // which has always summed quantities.
    const unitsOf = (data) => itemsOf(data).reduce((n, i) => n + (i.quantity || 1), 0);

    const syncFrom = (cart) => setCartCount(unitsOf(cart));

    const fetchCartCount = useCallback(async () => {
        if (!session) {
            setCartCount(0);
            return;
        }
        try {
            const res = await api.get('/cart');
            setCartCount(unitsOf(res.data));
        } catch (error) {
            console.error('Failed to fetch cart count:', error?.response?.data || error.message);
            setCartCount(0);
        }
    }, [session]);

    const getCart = useCallback(async () => {
        const res = await api.get('/cart');
        syncFrom(res.data);
        return res.data;
    }, []);

    const addToCart = useCallback(async (productId, quantity = 1) => {
        const res = await api.post('/cart', { productId, quantity });
        syncFrom(res.data);
        return res.data;
    }, []);

    const updateQuantity = useCallback(async (itemId, quantity) => {
        const res = await api.patch(`/cart/${itemId}`, { quantity });
        syncFrom(res.data);
        return res.data;
    }, []);

    const removeItem = useCallback(async (itemId) => {
        const res = await api.delete(`/cart/${itemId}`);
        syncFrom(res.data);
        return res.data;
    }, []);

    const saveForLater = useCallback(async (itemId) => {
        const res = await api.post(`/cart/${itemId}/save`);
        syncFrom(res.data);
        return res.data;
    }, []);

    const moveToCart = useCallback(async (itemId) => {
        const res = await api.post(`/cart/${itemId}/move`);
        syncFrom(res.data);
        return res.data;
    }, []);

    useEffect(() => {
        fetchCartCount();
    }, [fetchCartCount]);

    return (
        <CartContext.Provider
            value={{
                cartCount,
                fetchCartCount,
                getCart,
                addToCart,
                updateQuantity,
                removeItem,
                saveForLater,
                moveToCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used inside CartProvider');
    }
    return context;
}

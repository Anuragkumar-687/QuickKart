'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import api from '../lib/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { data: session } = useSession();
    const [cartCount, setCartCount] = useState(0);

    const fetchCartCount = async () => {
        if (!session) {
            setCartCount(0);
            return;
        }

        try {
            const res = await api.get('/cart');
            const data = res.data;

            let items = [];

            // Correct shape: { items: [...] }
            if (data && Array.isArray(data.items)) {
                items = data.items;
            }
            // Fallback: backend sends [...]
            else if (Array.isArray(data)) {
                items = data;
            }
            // Unexpected shape (403 / message / error)
            else {
                console.error("Unexpected cart response:", data);
            }

            setCartCount(items.length);
        } catch (error) {
            // 403 / Unauthorized / Network
            console.error('Failed to fetch cart count:', error?.response?.data || error.message);

            // Never allow crash
            setCartCount(0);
        }
    };

    const updateCartCount = (count) => {
        setCartCount(typeof count === 'number' ? count : 0);
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            console.log('Adding to cart:', { productId, quantity });

            const response = await api.post('/cart', { productId, quantity });

            console.log('Add to cart response:', response.data);

            await fetchCartCount(); // refresh count safely
            return true;
        } catch (error) {
            console.error('Failed to add to cart:', error?.response?.data || error.message);
            throw error;
        }
    };

    useEffect(() => {
        fetchCartCount();
    }, [session]);

    return (
        <CartContext.Provider value={{
            cartCount,
            fetchCartCount,
            addToCart,
            updateCartCount
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error("useCart must be used inside CartProvider");
    }
    return context;
}

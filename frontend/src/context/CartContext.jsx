'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import api from '../lib/api';

const CartContext = createContext();

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
            // Assuming the API returns the cart with items
            const items = res.data.items || [];
            // Calculate total quantity or just number of unique items? 
            // Flipkart shows number of unique items usually, or total qty. 
            // Let's do total quantity for now as it's more informative, or length if preferred.
            // User said "number like in flipkart". Flipkart usually shows '1' for 1 item.
            // Let's count unique items (items.length) as is common in many navbars, 
            // but total quantity is also fine. Let's stick to items.length for now as it's simpler to visualize "3 items in cart".
            setCartCount(items.length);
        } catch (error) {
            console.error('Failed to fetch cart count', error);
        }
    };

    const updateCartCount = (count) => {
        setCartCount(count);
    };

    const addToCart = async (productId, quantity = 1) => {
        try {
            console.log('Adding to cart:', { productId, quantity });
            const response = await api.post('/cart', { productId, quantity });
            console.log('Add to cart response:', response.data);
            await fetchCartCount(); // Refresh count after adding
            return true;
        } catch (error) {
            console.error('Failed to add to cart - Full error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error status:', error.response?.status);
            throw error;
        }
    };

    useEffect(() => {
        fetchCartCount();
    }, [session]);

    return (
        <CartContext.Provider value={{ cartCount, fetchCartCount, addToCart, updateCartCount }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    return useContext(CartContext);
}

'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import api from '../lib/api';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
    const { data: session } = useSession();
    const [wishlistItems, setWishlistItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchWishlist = async () => {
        if (!session) {
            setWishlistItems([]);
            return;
        }

        setLoading(true);
        try {
            const res = await api.get('/wishlist');
            // The backend returns the wishlist object with its items: { items: [...] }
            setWishlistItems(res.data?.items || []);
        } catch (error) {
            console.error('Failed to fetch wishlist:', error?.response?.data || error.message);
            setWishlistItems([]);
        } finally {
            setLoading(false);
        }
    };

    const addToWishlist = async (productId) => {
        if (!session) return false;

        try {
            console.log('Adding to wishlist:', productId);
            const res = await api.post('/wishlist', { productId });
            setWishlistItems(res.data?.items || []);
            return true;
        } catch (error) {
            console.error('Failed to add to wishlist:', error?.response?.data || error.message);
            throw error;
        }
    };

    const removeFromWishlist = async (productId) => {
        if (!session) return false;

        try {
            console.log('Removing from wishlist:', productId);
            const res = await api.delete(`/wishlist/${productId}`);
            setWishlistItems(res.data?.items || []);
            return true;
        } catch (error) {
            console.error('Failed to remove from wishlist:', error?.response?.data || error.message);
            throw error;
        }
    };

    const toggleWishlist = async (productId) => {
        if (!session) {
            return false;
        }

        const isItemInWishlist = isInWishlist(productId);
        if (isItemInWishlist) {
            return await removeFromWishlist(productId);
        } else {
            return await addToWishlist(productId);
        }
    };

    const isInWishlist = (productId) => {
        return wishlistItems.some(item => item.productId === productId);
    };

    useEffect(() => {
        fetchWishlist();
    }, [session]);

    return (
        <WishlistContext.Provider value={{
            wishlistItems,
            wishlistCount: wishlistItems.length,
            loading,
            fetchWishlist,
            addToWishlist,
            removeFromWishlist,
            toggleWishlist,
            isInWishlist
        }}>
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used inside WishlistProvider');
    }
    return context;
}

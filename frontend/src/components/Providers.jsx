'use client';

import { SessionProvider } from 'next-auth/react';
import { CartProvider } from '../context/CartContext';
import { WishlistProvider } from '../context/WishlistContext';

export function Providers({ children }) {
    return (
        <SessionProvider>
            <CartProvider>
                <WishlistProvider>
                    {children}
                </WishlistProvider>
            </CartProvider>
        </SessionProvider>
    );
}

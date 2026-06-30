'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import api from '../lib/api';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { data: session } = useSession();
  const [items, setItems] = useState([]);
  const [ids, setIds] = useState(() => new Set());

  const apply = (list) => {
    const safe = Array.isArray(list) ? list : [];
    setItems(safe);
    setIds(new Set(safe.map((w) => w.productId)));
  };

  const refresh = useCallback(async () => {
    if (!session) {
      apply([]);
      return;
    }
    try {
      const res = await api.get('/wishlist');
      apply(res.data);
    } catch (_) {
      apply([]);
    }
  }, [session]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Toggle a product in the wishlist. Returns { requireAuth } or { wishlisted }.
  const toggle = useCallback(
    async (productId) => {
      if (!session) return { requireAuth: true };
      const res = await api.post(`/wishlist/${productId}`);
      apply(res.data.items);
      return { wishlisted: res.data.wishlisted };
    },
    [session]
  );

  const remove = useCallback(
    async (productId) => {
      if (!session) return;
      const res = await api.delete(`/wishlist/${productId}`);
      apply(res.data.items);
    },
    [session]
  );

  const isWishlisted = useCallback((productId) => ids.has(productId), [ids]);

  return (
    <WishlistContext.Provider
      value={{ items, count: items.length, toggle, remove, isWishlisted, refresh }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
}

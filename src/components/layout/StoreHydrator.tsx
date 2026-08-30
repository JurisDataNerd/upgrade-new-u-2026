'use client';

import { useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';

/**
 * Rehydrates the persisted game store from localStorage on the client.
 * Mounted once in the root layout; the store uses `skipHydration: true`
 * so the server-rendered HTML stays deterministic.
 */
export function StoreHydrator() {
  useEffect(() => {
    useGameStore.persist.rehydrate();
  }, []);

  return null;
}

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  getPendingTransactions,
  enqueuePendingTransaction,
  cacheProducts,
  getCachedProducts,
  PendingTransaction,
} from '@/lib/offline-db';
import { syncEngine } from '@/lib/sync-engine';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

interface OfflineContextType {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  pendingItems: PendingTransaction[];
  syncNow: () => Promise<void>;
  queueTransaction: (
    type: PendingTransaction['type'],
    endpoint: string,
    payload: any
  ) => Promise<PendingTransaction>;
  preloadCache: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [pendingItems, setPendingItems] = useState<PendingTransaction[]>([]);

  const refreshPendingQueue = useCallback(async () => {
    try {
      const items = await getPendingTransactions();
      setPendingItems(items);
    } catch (e) {
      console.warn('Failed to read offline queue:', e);
    }
  }, []);

  const syncNow = useCallback(async () => {
    if (!navigator.onLine) {
      toast.error('Cannot sync while offline. Please check your internet connection.');
      return;
    }
    setIsSyncing(true);
    await syncEngine.sync();
    await refreshPendingQueue();
    setIsSyncing(false);
  }, [refreshPendingQueue]);

  const queueTransaction = useCallback(
    async (type: PendingTransaction['type'], endpoint: string, payload: any) => {
      const item = await enqueuePendingTransaction(type, endpoint, payload);
      await refreshPendingQueue();
      toast.info('Recorded offline. Transaction will auto-sync when online.');
      return item;
    },
    [refreshPendingQueue]
  );

  const preloadCache = useCallback(async () => {
    if (!navigator.onLine) return;
    try {
      const res = await apiClient.get('/products?pageSize=500');
      const products = res.data?.data || res.data || [];
      if (Array.isArray(products) && products.length > 0) {
        await cacheProducts(products);
        console.log(`[PWA] Preloaded ${products.length} products to IndexedDB cache.`);
      }
    } catch (e) {
      console.warn('[PWA] Failed to preload catalog cache:', e);
    }
  }, []);

  useEffect(() => {
    refreshPendingQueue();
    preloadCache();

    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Back online! Triggering automatic background sync...');
      syncNow();
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.warning('Working offline. Transactions will be queued locally.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [refreshPendingQueue, syncNow, preloadCache]);

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingCount: pendingItems.length,
        pendingItems,
        syncNow,
        queueTransaction,
        preloadCache,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
}

import apiClient from '@/lib/api-client';
import {
  getPendingTransactions,
  removePendingTransaction,
  updatePendingTransactionStatus,
  PendingTransaction,
} from './offline-db';
import { toast } from 'sonner';
import { queryClient } from '@/lib/query-client';

export class SyncEngine {
  private isSyncing = false;

  async sync(): Promise<{ successCount: number; failCount: number }> {
    if (this.isSyncing) return { successCount: 0, failCount: 0 };
    if (!navigator.onLine) return { successCount: 0, failCount: 0 };

    this.isSyncing = true;
    const pendingItems = await getPendingTransactions();

    if (pendingItems.length === 0) {
      this.isSyncing = false;
      return { successCount: 0, failCount: 0 };
    }

    let successCount = 0;
    let failCount = 0;

    toast.info(`Syncing ${pendingItems.length} offline transaction(s)...`);

    for (const item of pendingItems) {
      try {
        await updatePendingTransactionStatus(item.id, 'syncing');
        await apiClient.post(item.endpoint, item.payload);
        await removePendingTransaction(item.id);
        successCount++;
      } catch (error: any) {
        failCount++;
        const msg = error?.response?.data?.message || error?.message || 'Sync failed';
        await updatePendingTransactionStatus(item.id, 'failed', msg);
        console.warn(`[SyncEngine] Failed to sync ${item.id}:`, error);
      }
    }

    if (successCount > 0) {
      toast.success(`Successfully synchronized ${successCount} offline transaction(s)!`);
      queryClient.invalidateQueries();
    }

    if (failCount > 0) {
      toast.error(`${failCount} offline transaction(s) failed to sync. Will retry later.`);
    }

    this.isSyncing = false;
    return { successCount, failCount };
  }
}

export const syncEngine = new SyncEngine();

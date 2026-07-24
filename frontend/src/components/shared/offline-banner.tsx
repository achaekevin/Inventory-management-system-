import React from 'react';
import { WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useOffline } from '@/hooks/use-offline';
import { Button } from '@/components/ui/button';

export const OfflineBanner: React.FC = () => {
  const { isOnline, isSyncing, pendingCount, syncNow } = useOffline();

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  return (
    <div
      className={`w-full px-4 py-2 text-xs font-medium flex items-center justify-between transition-colors shadow-sm ${
        !isOnline
          ? 'bg-amber-500/15 border-b border-amber-500/30 text-amber-700 dark:text-amber-300'
          : isSyncing
          ? 'bg-blue-500/15 border-b border-blue-500/30 text-blue-700 dark:text-blue-300'
          : 'bg-emerald-500/15 border-b border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
      }`}
    >
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="h-4 w-4 text-amber-600 animate-pulse" />
            <span>
              <strong>Offline Mode Active:</strong> You can view cached inventory and record transactions offline.
              {pendingCount > 0 && ` (${pendingCount} queued for sync)`}
            </span>
          </>
        ) : isSyncing ? (
          <>
            <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
            <span>Synchronizing offline transactions with server...</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            <span>Online — {pendingCount} offline transaction(s) pending sync.</span>
          </>
        )}
      </div>

      {isOnline && pendingCount > 0 && (
        <Button
          size="sm"
          variant="outline"
          onClick={syncNow}
          disabled={isSyncing}
          className="h-7 text-xs px-2.5 gap-1.5 border-current hover:bg-background/40"
        >
          <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </Button>
      )}
    </div>
  );
};

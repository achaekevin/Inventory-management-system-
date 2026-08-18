import { useState, useEffect } from 'react'

interface OfflineState {
  isOnline: boolean
  isSyncing: boolean
  pendingCount: number
  syncNow: () => void
}

export function useOffline(): OfflineState {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const syncNow = () => {
    if (!isOnline) return
    
    setIsSyncing(true)
    // Simulate sync process
    setTimeout(() => {
      setIsSyncing(false)
      setPendingCount(0)
    }, 2000)
  }

  return {
    isOnline,
    isSyncing,
    pendingCount,
    syncNow,
  }
}
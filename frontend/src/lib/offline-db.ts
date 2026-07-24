/**
 * IndexedDB storage engine for offline PWA operation.
 * Manages cached entity data and queued offline transactions.
 */

const DB_NAME = 'inventrack_offline_db';
const DB_VERSION = 1;

export interface PendingTransaction {
  id: string;
  type: 'create_sale' | 'adjust_stock' | 'create_customer';
  endpoint: string;
  payload: any;
  createdAt: string;
  status: 'pending' | 'syncing' | 'failed';
  errorMessage?: string;
}

export function openOfflineDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Cached Products catalog
      if (!db.objectStoreNames.contains('products')) {
        db.createObjectStore('products', { keyPath: 'id' });
      }

      // 2. Cached Customers list
      if (!db.objectStoreNames.contains('customers')) {
        db.createObjectStore('customers', { keyPath: 'id' });
      }

      // 3. Pending offline transactions queue
      if (!db.objectStoreNames.contains('pendingTransactions')) {
        const store = db.createObjectStore('pendingTransactions', { keyPath: 'id' });
        store.createIndex('status', 'status', { unique: false });
        store.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── Products Cache ──────────────────────────────────────────────────────────

export async function cacheProducts(products: any[]): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readwrite');
    const store = tx.objectStore('products');
    store.clear();
    products.forEach((p) => store.put(p));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedProducts(): Promise<any[]> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('products', 'readonly');
    const store = tx.objectStore('products');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// ─── Customers Cache ─────────────────────────────────────────────────────────

export async function cacheCustomers(customers: any[]): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readwrite');
    const store = tx.objectStore('customers');
    store.clear();
    customers.forEach((c) => store.put(c));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedCustomers(): Promise<any[]> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('customers', 'readonly');
    const store = tx.objectStore('customers');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

// ─── Pending Transactions Queue ──────────────────────────────────────────────

export async function enqueuePendingTransaction(
  type: PendingTransaction['type'],
  endpoint: string,
  payload: any
): Promise<PendingTransaction> {
  const db = await openOfflineDB();
  const transactionItem: PendingTransaction = {
    id: `off-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    type,
    endpoint,
    payload,
    createdAt: new Date().toISOString(),
    status: 'pending',
  };

  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingTransactions', 'readwrite');
    const store = tx.objectStore('pendingTransactions');
    store.put(transactionItem);
    tx.oncomplete = () => resolve(transactionItem);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getPendingTransactions(): Promise<PendingTransaction[]> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingTransactions', 'readonly');
    const store = tx.objectStore('pendingTransactions');
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

export async function removePendingTransaction(id: string): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingTransactions', 'readwrite');
    const store = tx.objectStore('pendingTransactions');
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function updatePendingTransactionStatus(
  id: string,
  status: PendingTransaction['status'],
  errorMessage?: string
): Promise<void> {
  const db = await openOfflineDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pendingTransactions', 'readwrite');
    const store = tx.objectStore('pendingTransactions');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item = getReq.result as PendingTransaction;
      if (item) {
        item.status = status;
        if (errorMessage) item.errorMessage = errorMessage;
        store.put(item);
      }
    };

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

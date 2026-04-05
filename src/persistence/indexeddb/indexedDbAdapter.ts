import { StorageAdapter } from "../contracts/storageAdapter";
import { openDebtCommandCenterDb } from "./db";

function promisifyRequest<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB request failed."));
  });
}

function promisifyTransaction(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction failed."));
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error("IndexedDB transaction aborted."));
    };
  });
}

export class IndexedDbStorageAdapter implements StorageAdapter {
  async getAll<T>(storeName: string): Promise<T[]> {
    const database = await openDebtCommandCenterDb();
    const transaction = database.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const result = await promisifyRequest(store.getAll() as IDBRequest<T[]>);
    await promisifyTransaction(transaction);
    return result;
  }

  async getOne<T>(storeName: string, key: IDBValidKey): Promise<T | null> {
    const database = await openDebtCommandCenterDb();
    const transaction = database.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const result = await promisifyRequest(store.get(key) as IDBRequest<T | undefined>);
    await promisifyTransaction(transaction);
    return result ?? null;
  }

  async put<T>(storeName: string, value: T): Promise<void> {
    const database = await openDebtCommandCenterDb();
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.put(value);
    await promisifyTransaction(transaction);
  }

  async delete(storeName: string, key: IDBValidKey): Promise<void> {
    const database = await openDebtCommandCenterDb();
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.delete(key);
    await promisifyTransaction(transaction);
  }

  async clear(storeName: string): Promise<void> {
    const database = await openDebtCommandCenterDb();
    const transaction = database.transaction(storeName, "readwrite");
    const store = transaction.objectStore(storeName);
    store.clear();
    await promisifyTransaction(transaction);
  }
}

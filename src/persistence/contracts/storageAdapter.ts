export interface StorageAdapter {
  getAll<T>(storeName: string): Promise<T[]>;
  getOne<T>(storeName: string, key: IDBValidKey): Promise<T | null>;
  put<T>(storeName: string, value: T): Promise<void>;
  delete(storeName: string, key: IDBValidKey): Promise<void>;
  clear(storeName: string): Promise<void>;
}

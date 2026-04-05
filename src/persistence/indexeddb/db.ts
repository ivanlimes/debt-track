import { APP_DB_NAME, APP_DB_VERSION, STORE_NAMES } from "./db.schema";

let dbPromise: Promise<IDBDatabase> | null = null;

function createObjectStore(
  database: IDBDatabase,
  storeName: string,
  keyPath: string,
): void {
  if (!database.objectStoreNames.contains(storeName)) {
    database.createObjectStore(storeName, { keyPath });
  }
}

export function openDebtCommandCenterDb(): Promise<IDBDatabase> {
  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise((resolve, reject) => {
    const request = window.indexedDB.open(APP_DB_NAME, APP_DB_VERSION);

    request.onerror = () => {
      reject(request.error ?? new Error("Unable to open IndexedDB database."));
    };

    request.onupgradeneeded = () => {
      const database = request.result;

      createObjectStore(database, STORE_NAMES.accounts, "id");
      createObjectStore(database, STORE_NAMES.payments, "id");
      createObjectStore(database, STORE_NAMES.payoffPlans, "id");
      createObjectStore(database, STORE_NAMES.preferences, "id");
      createObjectStore(database, STORE_NAMES.appMeta, "key");
    };

    request.onsuccess = () => {
      resolve(request.result);
    };
  });

  return dbPromise;
}

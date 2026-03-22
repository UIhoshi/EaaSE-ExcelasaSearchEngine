import type { CachedWorkbook } from "../types";

const DB_NAME = "excel-strict-searcher";
const STORE_NAME = "cached-workbooks";
const DB_VERSION = 3;

const openDatabase = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;
      if (database.objectStoreNames.contains(STORE_NAME)) {
        database.deleteObjectStore(STORE_NAME);
      }
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        database.createObjectStore(STORE_NAME, { keyPath: "fingerprint" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });

const withStore = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const database = await openDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
};

export const getAllCachedWorkbooks = async (): Promise<CachedWorkbook[]> =>
  withStore("readonly", (store) => store.getAll());

export const saveCachedWorkbook = async (workbook: CachedWorkbook): Promise<void> => {
  await withStore("readwrite", (store) => store.put(workbook));
};

export const deleteCachedWorkbook = async (fingerprint: string): Promise<void> => {
  await withStore("readwrite", (store) => store.delete(fingerprint));
};

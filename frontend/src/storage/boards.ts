import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import { openDB } from 'idb';

const DB_NAME = 'boards-db';
const STORE = 'boards';

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE)) {
      db.createObjectStore(STORE);
    }
  },
});

export type StoredBoard = {
  elements: readonly ExcalidrawElement[];
  appState?: any;
  files?: Record<string, any>;
};

export async function loadBoardLocal(id: number): Promise<StoredBoard | null> {
  const db = await dbPromise;
  return (await db.get(STORE, id)) ?? null;
}

export async function saveBoardLocal(id: number, data: StoredBoard) {
  const db = await dbPromise;
  await db.put(STORE, data, id);
}

export async function deleteBoardLocal(id: number) {
  const db = await dbPromise;
  await db.delete(STORE, id);
}

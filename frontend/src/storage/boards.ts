import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { BinaryFileData } from '@excalidraw/excalidraw/types';
import { openDB } from 'idb';
import type { DataURL } from '@excalidraw/excalidraw/types';

const DB_NAME = 'boards-db';
const BOARDS_STORE = "boards";
const FILES_STORE = "files";

const dbPromise = openDB(DB_NAME, 13, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(BOARDS_STORE)) {
      db.createObjectStore(BOARDS_STORE);
    }
    if (!db.objectStoreNames.contains(FILES_STORE)) {
      const store = db.createObjectStore(FILES_STORE, {
        keyPath: ['boardId', 'fileId']
      });

      store.createIndex('boardId', 'boardId');
    }
  },
});

export type StoredBoard = {
  elements: readonly ExcalidrawElement[];
  appState?: any;
};

export async function saveBoardLocal(
  id: number,
  data: {
    elements: readonly ExcalidrawElement[];
    appState?: any;
    files?: Record<string, BinaryFileData>;
  } 
) {
  const db = await dbPromise;


  const filesToSave: { boardId: number; fileId: string; blob: Blob }[] = [];
  if (data.files) {
    for (const file of Object.values(data.files)) {
      if (!file.dataURL) continue;

      const existing = await db.get(FILES_STORE, [id, file.id]);
      if (existing) continue;

      const blob = await (await fetch(file.dataURL)).blob();

      filesToSave.push({
        boardId: id,
        fileId: file.id,
        blob
      });
    }
  }

  const tx = db.transaction([BOARDS_STORE, FILES_STORE], 'readwrite');

  // Saving board data
  await tx.objectStore(BOARDS_STORE).put(
    {
      elements: data.elements,
      appState: data.appState,
    },
    id
  );

  // Saving files on board
  const filesStore = tx.objectStore(FILES_STORE);

  for (const file of filesToSave) {
    filesStore.put(file);
  }

  await tx.done;
}

export async function loadBoardLocal(id: number): Promise<any | null> {
  const db = await dbPromise;
  
  const board = await db.get(BOARDS_STORE, id);
  if (!board) return null;

  const files: Record<string, BinaryFileData> = {};

  const tx = db.transaction(FILES_STORE, 'readonly');
  const index = tx.store.index('boardId');

  const records = await index.getAll(id);

  for (const record of records) {
    const blob = record.blob;

    const dataURL = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    }) as DataURL;

    files[record.fileId] = {
      id: record.fileId,
      mimeType: blob.type,
      dataURL,
      created: Date.now(),
      lastRetrieved: Date.now(),
    };
  }

  return {
    elements: board.elements,
    appState: board.appState,
    files,
  }
}

export async function deleteBoardLocal(id: number) {
  const db = await dbPromise;

  const tx = db.transaction([BOARDS_STORE, FILES_STORE], 'readwrite');

  await tx.objectStore(BOARDS_STORE).delete(id);

  const index = tx.objectStore(FILES_STORE).index('boardId');
  const keys = await index.getAllKeys(id);

  for (const key of keys) {
    tx.objectStore(FILES_STORE).delete(key);
  }

  await tx.done;
}

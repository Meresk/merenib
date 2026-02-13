import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { BinaryFileData } from '@excalidraw/excalidraw/types';
import { openDB } from 'idb';
import type { FileId } from '@excalidraw/excalidraw/element/types';
import type { DataURL } from '@excalidraw/excalidraw/types';

const DB_NAME = 'boards-db';
const BOARDS_STORE = "boards";
const FILES_STORE = "files";

const dbPromise = openDB(DB_NAME, 7, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(BOARDS_STORE)) {
      db.createObjectStore(BOARDS_STORE);
    }
    if (!db.objectStoreNames.contains(FILES_STORE)) {
      db.createObjectStore(FILES_STORE);
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

  // Saving board data
  await db.put(BOARDS_STORE, {
    elements: data.elements,
    appState: data.appState,
  }, id);

  // Saving files on board
  if (data.files) {
    for (const file of Object.values(data.files)) {
      if (!file.dataURL) continue;

      const blob = await (await fetch(file.dataURL)).blob();

      await db.put(FILES_STORE, blob, `${id}_${file.id}`)
    };
  }
}

export async function loadBoardLocal(id: number): Promise<any | null> {
  const db = await dbPromise;
  
  const board = await db.get(BOARDS_STORE, id);
  if (!board) return null;

  const files: Record<string, BinaryFileData> = {};

  const keys = await db.getAllKeys(FILES_STORE);

  for (const key of keys) {
    if (!String(key).startsWith(`${id}_`)) continue;

    const blob = await db.get(FILES_STORE, key);

    const dataURL = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    }) as DataURL;

    const fileId = String(key).split("_")[1] as FileId;
    
    files[fileId] = {
      id: fileId,
      mimeType: blob.type,
      dataURL: dataURL,
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

  await db.delete(BOARDS_STORE, id);

  const keys = await db.getAllKeys(FILES_STORE);

  for (const key of keys) {
    if (String(key).startsWith(`${id}_`)) {
      await db.delete(FILES_STORE, key);
    }
  }
}

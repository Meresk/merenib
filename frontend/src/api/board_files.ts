import type { FileId } from "@excalidraw/excalidraw/element/types";
import type { BinaryFileData, BinaryFiles, DataURL } from "@excalidraw/excalidraw/types";

import { apiFetch, apiFetchFile } from "./client";
import { runWithLimit } from "../helpers/runWithLimit";
import { getBoardFileBlobs } from "../storage/boards";

const DEFAULT_CONCURRENCY = 3;


// --------------------
// Helpers
// --------------------

async function blobToDataURL(blob: Blob): Promise<DataURL> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onloadend = () => {
      resolve(reader.result as DataURL);
    };

    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}


// --------------------
// API methods
// --------------------

/**
 * Get file from board from server and convert it for DataURL
 * @param boardId Board ID from which you need file
 * @param fileId Excalidraw file ID 
 * @returns File with its DataURL
 */
export async function fetchBoardFile(
  boardId: number,
  fileId: FileId
): Promise<BinaryFileData> {

  const blob = await apiFetchFile(
    `/boards/${boardId}/files/${fileId}`
  );

  const dataURL = await blobToDataURL(blob);

  return {
    id: fileId,
    dataURL,
    mimeType: blob.type as any,
    created: Date.now(),
  };
}

/**
 * Get all files from board from server
 * @param boardId Board ID from which you need files
 * @param fileIds array of excalidraw file Ids 
 * @returns files array
 */
export async function fetchBoardFiles(
  boardId: number,
  fileIds: FileId[],
  concurrency = DEFAULT_CONCURRENCY
): Promise<BinaryFiles> {
  const result: BinaryFiles = {};

  const tasks = fileIds.map((fileId) => async () => {
    const file = await fetchBoardFile(boardId, fileId);
    result[fileId] = file;
    return file;
  });

  await runWithLimit(tasks, concurrency);
  return result;
}

/**
 * Save all not existing on server files to server from board 
 * @param boardId board ID
 */
export async function saveBoardFiles(
    boardId: number,
    concurrency = DEFAULT_CONCURRENCY
) {
    const existingServerFiles = await getFileIds(boardId);
    const localFiles = await getBoardFileBlobs(boardId)

    const filesToUpload = Object.entries(localFiles)
    .filter(([fileId]) => !existingServerFiles.includes(fileId));
    
    const tasks = filesToUpload.map(([fileId, blob]) => async () => {
        await uploadBoardFile(boardId, fileId as FileId, blob);
    });

  await runWithLimit(tasks, concurrency);
}

/**
 * Get all file Ids from board
 * @param boardId Board ID
 * @returns array of file Ids
 */
export async function getFileIds(boardId: number) {
    return await apiFetch<string[]>(`/boards/${boardId}/files`);
}


/**
 * Upload file to server
 * @param boardId Board ID of file
 * @param fileId Excalidraw file ID
 * @param blob File data
 */
export async function uploadBoardFile(boardId: number, fileId: FileId, blob: Blob) {
  const formData = new FormData();
  formData.append("file", blob, fileId);
  formData.append("file_id", fileId);

  const res = await fetch(
    import.meta.env.VITE_API_BASE_URL +
      `/boards/${boardId}/files`,
    {
      method: "POST",
      credentials: "include",
      body: formData,
    }
  );

  if (!res.ok) {
    throw new Error("File upload failed");
  }
}
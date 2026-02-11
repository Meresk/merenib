import type { ExcalidrawElement, ExcalidrawImageElement, FileId } from "@excalidraw/excalidraw/element/types";
import type { BinaryFiles} from "@excalidraw/excalidraw/types";

// Type guard: проверяет, что элемент — изображение с fileId
function isExcalidrawImageElement(el: ExcalidrawElement): el is ExcalidrawImageElement {
  return el.type === "image" && "fileId" in el;
}

function cleanUpBoardFiles(
  elements: readonly ExcalidrawElement[],
  files: Record<FileId, BinaryFiles>
) {
  // Берём только активные image-элементы
  const imageElements = elements.filter(
    (el): el is ExcalidrawImageElement => !el.isDeleted && isExcalidrawImageElement(el)
  );

  const usedFileIds = new Set(imageElements.map(el => el.fileId));

  const newFiles: Record<FileId, BinaryFiles> = {};
  for (const [id, file] of Object.entries(files)) {
    // Здесь приводим ключ к FileId
    const fileId = id as FileId;
    if (usedFileIds.has(fileId)) {
      newFiles[fileId] = file; // оставляем только используемые
    }
  }

  console.log("Cleaned up files:", newFiles);
  return newFiles;
}

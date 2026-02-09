import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard, updateBoard } from '../api/boards';
import type { Board } from '../api/types';

import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import "@excalidraw/excalidraw/index.css";

import styles from './styles/BoardPage.module.css';

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [files, setFiles] = useState<BinaryFiles>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  useEffect(() => {
    if (!id) return;

    getBoard(+id)
      .then((b) => {
        setBoard(b);
        try {
          const loadedScene = JSON.parse(b.data);
          setElements(loadedScene.elements || []);
          setFiles(loadedScene.files || {});
        } catch {
          setElements([]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!board || !excalidrawAPI) return;

    setSaving(true);
    try {
      const scene = {
        elements: excalidrawAPI.getSceneElements(),
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
      };
      await updateBoard(board.id, JSON.stringify(scene));
      alert('Board saved!');
    } catch (e) {
      alert('Error saving board');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div>Loading board…</div>;
  if (!board) return <div>Board not found</div>;

  return (
    <div className={styles.container}>
      {/* Кнопка раскрытия панели */}
      <button
        className={styles.panelToggle}
        onClick={() => setPanelOpen(!panelOpen)}
        title="Menu"
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="currentColor"
        >
          <circle cx="4" cy="12" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="20" cy="12" r="2" />
        </svg>
      </button>

      {/* Раскрытая панель кнопок */}
      {panelOpen && (
        <div className={styles.toolbar}>
          <button onClick={handleSave} title="Save">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
            </svg>
          </button>

          <button onClick={() => {}} title="Load">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
            </svg>
          </button>

          <button onClick={() => navigate(-1)} title="Exit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </div>
      )}

      <div className={styles.excalidrawWrapper}>
        <Excalidraw
          key={board.id}
          initialData={{ elements, files }}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={(elements) => setElements(elements)}
        />
      </div>
    </div>
  );
}

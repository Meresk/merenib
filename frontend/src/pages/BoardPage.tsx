import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard, updateBoard } from '../api/boards';

import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import type { BinaryFiles, ExcalidrawImperativeAPI } from '@excalidraw/excalidraw/types';
import "@excalidraw/excalidraw/index.css";

import styles from './styles/BoardPage.module.css';
import { loadBoardLocal, saveBoardLocal } from '../storage/boards';

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [boardId, setBoardId] = useState<number | null>(null);

  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [files, setFiles] = useState<BinaryFiles>({});

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const saveTimeout = useRef<number | null>(null);


  useEffect(() => {
    if (!id) return;

    const numericId = Number(id);
    setBoardId(numericId);
    setLoading(true);

    async function init() {
      // грузим локальные данные
      const local = await loadBoardLocal(numericId);
      if (local) {
        setElements(local.elements || []);
        setFiles(local.files || {});
      } else {
        setElements([]);
        setFiles({});
      }

      // проверяем доступ на сервере
      try {
        await getBoard(numericId);
      } catch (err: any) {
        alert('Access denied or board not found');
        navigate('/app');
        return;
      } finally {
        setLoading(false);
      }
    }

    init();
  }, [id]);

  
  function handleChange(elements: readonly ExcalidrawElement[]) {
    setElements(elements);

    if (!boardId || !excalidrawAPI) return;

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = window.setTimeout(() => {
      saveBoardLocal(boardId, {
        elements,
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
      });
    }, 800);
  }

  async function handleSave() {
    if (!boardId || !excalidrawAPI) return;

    setSaving(true);
    try {
      const scene = {
        elements: excalidrawAPI.getSceneElements(),
        appState: excalidrawAPI.getAppState(),
        files: excalidrawAPI.getFiles(),
      };

      await updateBoard(boardId, JSON.stringify(scene));
      alert('Board saved!');
    } catch (e) {
      alert('Error saving board');
      console.error(e);
    } finally {
      setSaving(false);
    }
  }

  async function handleLoadFromServer() {
    if (!boardId) return;

    setLoading(true);
    try {
      const b = await getBoard(boardId);
      const scene = JSON.parse(b.data);

      setElements(scene.elements || []);
      setFiles(scene.files || {});

      await saveBoardLocal(b.id, scene);
    } catch (e) {
      console.error(e);
      alert('Server load failed');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading board…</div>;
  if (!boardId) return <div>Board not found</div>;

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

      <div className={`${styles.toolbar} ${panelOpen ? styles.open : styles.closed}`}>
        <button onClick={handleSave} title="Save">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
          </svg>
        </button>
        <button onClick={handleLoadFromServer} title="Load">
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


      <div className={styles.excalidrawWrapper}>
        <Excalidraw
          initialData={{ elements, files }}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBoard, updateBoard } from '../api/boards';

import { Excalidraw } from '@excalidraw/excalidraw';
import type { ExcalidrawElement, FileId } from '@excalidraw/excalidraw/element/types';
import type { BinaryFiles, ExcalidrawImperativeAPI, AppState } from '@excalidraw/excalidraw/types';
import "@excalidraw/excalidraw/index.css";

import styles from './styles/BoardPage.module.css';
import { loadBoardLocal, saveBoardLocal } from '../storage/boards';
import { fetchBoardFiles, getFileIds, saveBoardFiles } from '../api/board_files';
import toast from 'react-hot-toast';

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [boardId, setBoardId] = useState<number | null>(null);

  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [files, setFiles] = useState<BinaryFiles>({});
  const [appState, setAppState] = useState<AppState>();
  

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI | null>(null);
  const [panelOpen, setPanelOpen] = useState(false);

  const saveTimeout = useRef<number | null>(null);

  const [saveMorph, setSaveMorph] = useState(false);
  const [loadMorph, setLoadMorph] = useState(false);

  // INIT
  useEffect(() => {
    if (!id) return;

    const numericId = Number(id);
    setBoardId(numericId);
    setLoading(true);

    async function init() {
      try {
        // Проверяем доступ И получаем данные
        const serverBoard = await getBoard(numericId);

        // Пробуем загрузить локально
        const local = await loadBoardLocal(numericId);

        if (local) {
          setElements(local.elements || []);
          setFiles(local.files || {});
          setAppState(local.appState);
        } else {
          // Если нет локальных — используем serverBoard
          const scene = JSON.parse(serverBoard.data);

          const fileIds = await getFileIds(numericId);
          const files = await fetchBoardFiles(numericId, fileIds as FileId[]);

          const safeAppState = scene.appState || {};
          if (!Array.isArray(safeAppState.collaborators)) {
            safeAppState.collaborators = [];
          }

          setElements(scene.elements || []);
          setAppState(safeAppState);
          setFiles(files);

          await saveBoardLocal(numericId, {
            elements: scene.elements,
            appState: safeAppState,
            files,
          });

          toast.success('Board loaded from server');
        }

      } catch (err) {
        toast.error('Access denied or load failed');
        navigate('/app');
      } finally {
        setLoading(false);
      }
    }

    init();
}, [id]);



  /**
   * Save board data to server
   */
  const handleConfirmSave = async () => {
    if (!boardId || !excalidrawAPI) return;

    setSaving(true);
    try {
      const scene = {
        elements: excalidrawAPI.getSceneElements(),
        appState: excalidrawAPI.getAppState(),
      };
      
      // scene saving
      await updateBoard(boardId, JSON.stringify(scene));

      // files saving
      await saveBoardFiles(boardId);

      toast.success('Board saved');
    } catch (e) {
      toast.error('Error saving board');
      console.error(e);
    } finally {
      setSaving(false);
      setSaveMorph(false); 
    }
  };

  /**
   * get board data from server
   */
  const handleConfirmLoad = async () => {
    if (!boardId) return;

    setLoading(true);
    try {
      const b = await getBoard(boardId);
      const scene = JSON.parse(b.data);
      const filesIds = await getFileIds(boardId);
      const files = await fetchBoardFiles(boardId, filesIds as FileId[]);
      const safeAppState = scene.appState || {};
      if (!Array.isArray(safeAppState.collaborators)) {
        safeAppState.collaborators = [];
      }

      // loading board
      setElements(scene.elements || []);
      setAppState(safeAppState);
      setFiles(files);

      // local save
      await saveBoardLocal(b.id, {
        elements: scene.elements,
        appState: scene.appState,
        files: files,
      });

      toast.success('Board loaded from server');
    } catch (e) {
      console.error(e);
      toast.error('Server board load failed');
    } finally {
      setLoading(false);
      setLoadMorph(false);
    }
  };

  const handleCancelSave = () => {
    setSaveMorph(false);
  };
  const handleCancelLoad = () => {
    setLoadMorph(false);
  };

  // autosave to IndexedDB
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
        files: excalidrawAPI.getFiles() ,
      });
    }, 1000);
  }

  if (loading) return <div>Loading board…</div>;
  if (!boardId) return <div>Board not found</div>;



  return (
    <div className={styles.container}>
      {/* Menu button */}
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
        {/* Save buttons group */}
        <div className={styles.buttonGroup}>
          {saveMorph ? (
            <div className={styles.confirmCancelGroup}>
              <button 
                onClick={handleConfirmSave} 
                className={styles.confirmButton}
                title="Confirm Save"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </button>
              <button 
                onClick={handleCancelSave} 
                className={styles.cancelButton}
                title="Cancel"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setSaveMorph(true)} 
              disabled={saving}
              title="Save"
            >
              {saving ? (
                <div className={styles.spinner}></div>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Load buttons group */}
        <div className={styles.buttonGroup}>
          {loadMorph ? (
            <div className={styles.confirmCancelGroup}>
              <button 
                onClick={handleConfirmLoad} 
                className={styles.confirmButton}
                title="Confirm Load"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                </svg>
              </button>
              <button 
                onClick={handleCancelLoad} 
                className={styles.cancelButton}
                title="Cancel"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setLoadMorph(true)} 
              title="Load"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Exit button */}
        <button onClick={() => navigate(-1)} title="Exit">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
          </svg>
        </button>
      </div>
      
      { /* Excalidraw board */}
      <div className={styles.excalidrawWrapper}>
        <Excalidraw
          key={boardId}
          initialData={{ elements, files, appState }}
          excalidrawAPI={(api) => setExcalidrawAPI(api)}
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
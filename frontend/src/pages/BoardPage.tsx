import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Excalidraw } from '@excalidraw/excalidraw';
import { getBoard, updateBoard } from '../api/boards';
import type { Board } from '../api/types';
import type { ExcalidrawElement } from '@excalidraw/excalidraw/element/types';
import "@excalidraw/excalidraw/index.css";

export function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [board, setBoard] = useState<Board | null>(null);
  const [elements, setElements] = useState<readonly ExcalidrawElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    getBoard(+id)
      .then((b) => {
        setBoard(b);
        try {
          setElements(JSON.parse(b.data)); // загрузка элементов Excalidraw
        } catch {
          setElements([]);
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSave() {
    if (!board) return;
    setSaving(true);
    try {
      await updateBoard(board.id, JSON.stringify(elements));
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
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 8, display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
        <div>{board.name}</div>
        <div>
          <button onClick={handleSave} disabled={saving} style={{ marginRight: 8 }}>
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button onClick={() => navigate(-1)}>Back</button>
        </div>
      </div>
      <div style={{ flex: 1 }}>
        <Excalidraw
          initialData={{ elements }}
          onChange={(elements) => setElements(elements)}
        />
      </div>
    </div>
  );
}

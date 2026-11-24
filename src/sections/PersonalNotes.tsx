import { useState, type FormEvent } from 'react';
import { Pencil, Plus, Trash2, X, Check } from 'lucide-react';
import { useDeviceValue } from '@/lib/deviceStorage';
import type { NoteRecord, StoryRecord } from '@/lib/journalData';

type LocalNote = { id: string; title: string; body: string };
const STORAGE_KEY = 'my-love:little-notes:v1';

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PersonalNotes({ notes, stories }: { notes: NoteRecord[]; stories: StoryRecord[] }) {
  const [localNotes, setLocalNotes, storageError] = useDeviceValue<LocalNote[]>(STORAGE_KEY, []);
  const [draft, setDraft] = useState({ title: '', body: '' });
  const [editing, setEditing] = useState<LocalNote | null>(null);

  const addNote = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft.title.trim() || !draft.body.trim()) return;
    setLocalNotes((current) => [...current, { id: createId(), title: draft.title.trim(), body: draft.body.trim() }]);
    setDraft({ title: '', body: '' });
  };
  const saveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing?.title.trim() || !editing.body.trim()) return;
    setLocalNotes((current) => current.map((note) => (note.id === editing.id ? editing : note)));
    setEditing(null);
  };

  return (
    <section className="personal-notes" aria-labelledby="notes-title">
      <div className="corner-section-head">
        <span className="section-kicker">Ghi chú nhỏ</span>
        <h3 id="notes-title">Mấy điều muốn nhớ</h3>
        <p>Cất lại câu nói, thói quen hay chi tiết bạn muốn giữ.</p>
      </div>
      {(notes.length > 0 || stories.length > 0 || localNotes.length > 0) ? (
        <div className="note-pages">
          {stories.map((story) => (
            <article key={story.id} className="note-page note-page--story">
              <span className="note-page__mark" aria-hidden>✳</span>
              <h4>{story.title}</h4>
              {story.body && <p>{story.body}</p>}
              {story.photo_url && <img src={story.photo_url} alt={story.title} loading="lazy" decoding="async" width="1000" height="750" />}
            </article>
          ))}
          {notes.map((note) => (
            <article key={note.id} className="note-page">
              <span className="note-page__mark" aria-hidden>✿</span>
              <h4>{note.title}</h4>
              {note.body && <p>{note.body}</p>}
              <span className="note-page__origin">Đã cất trong My Love</span>
            </article>
          ))}
          {localNotes.map((note) => (
            <article key={note.id} className="note-page note-page--local">
              {editing?.id === note.id ? (
                <form className="note-edit" onSubmit={saveEdit}>
                  <label htmlFor={`note-title-${note.id}`}>Tiêu đề</label>
                  <input id={`note-title-${note.id}`} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} maxLength={80} required />
                  <label htmlFor={`note-body-${note.id}`}>Nội dung</label>
                  <textarea id={`note-body-${note.id}`} value={editing.body} onChange={(event) => setEditing({ ...editing, body: event.target.value })} maxLength={600} rows={3} required />
                  <div><button type="submit" aria-label="Lưu ghi chú"><Check size={16} /></button><button type="button" aria-label="Hủy sửa" onClick={() => setEditing(null)}><X size={16} /></button></div>
                </form>
              ) : (
                <>
                  <span className="note-page__mark" aria-hidden>✿</span>
                  <h4>{note.title}</h4>
                  <p>{note.body}</p>
                  <div className="note-page__actions">
                    <button type="button" onClick={() => setEditing(note)} aria-label={`Sửa ghi chú: ${note.title}`}><Pencil size={15} /></button>
                    <button type="button" onClick={() => setLocalNotes((current) => current.filter((entry) => entry.id !== note.id))} aria-label={`Xóa ghi chú: ${note.title}`}><Trash2 size={15} /></button>
                  </div>
                </>
              )}
            </article>
          ))}
        </div>
      ) : (
        <div className="notes-empty">
          <span aria-hidden>✿</span>
          <p>Chưa có ghi chú. Viết ghi chú đầu tiên bên dưới.</p>
        </div>
      )}
      <form className="note-create" onSubmit={addNote}>
        <label htmlFor="new-note-title">Tiêu đề chiếc ghi chú</label>
        <input id="new-note-title" value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} maxLength={80} required />
        <label htmlFor="new-note-body">Nội dung</label>
        <textarea id="new-note-body" value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} maxLength={600} rows={3} required />
        <button type="submit" className="note-create__button"><Plus size={16} aria-hidden /> Cất ghi chú</button>
      </form>
      {storageError && <p className="storage-message" role="status">{storageError}</p>}
      <p className="local-only-note">Ghi chú chỉ lưu trên thiết bị này.</p>
    </section>
  );
}

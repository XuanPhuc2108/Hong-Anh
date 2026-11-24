import { useState, type FormEvent } from 'react';
import { Check, Pencil, Plus, Trash2, X } from 'lucide-react';
import { useDeviceValue } from '@/lib/deviceStorage';

type WishItem = { id: string; title: string; done: boolean };
const STORAGE_KEY = 'my-love:wishlist:v1';

function createId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function Wishlist() {
  const [items, setItems, storageError] = useDeviceValue<WishItem[]>(STORAGE_KEY, []);
  const [title, setTitle] = useState('');
  const [editing, setEditing] = useState<{ id: string; title: string } | null>(null);

  const completed = items.filter((item) => item.done).length;
  const progress = items.length > 0 ? completed / items.length : 0;
  const addItem = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    setItems((current) => [...current, { id: createId(), title: trimmed, done: false }]);
    setTitle('');
  };

  const saveEdit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editing?.title.trim()) return;
    setItems((current) => current.map((item) => (item.id === editing.id ? { ...item, title: editing.title.trim() } : item)));
    setEditing(null);
  };

  return (
    <section className="wishlist" aria-labelledby="wishlist-title">
      <div className="corner-section-head">
        <span className="section-kicker">Danh sách muốn làm</span>
        <h3 id="wishlist-title">Những điều muốn làm cùng nhau</h3>
        <p>Danh sách chỉ lưu trên thiết bị này.</p>
      </div>
      {items.length > 0 && (
        <div className="wishlist-progress" aria-label={`${completed} trên ${items.length} điều đã hoàn thành`}>
          <div className="wishlist-progress__copy">
            <span>{completed} / {items.length} điều đã làm</span>
            <span>{Math.round(progress * 100)}%</span>
          </div>
          <div className="wishlist-progress__track">
            <span style={{ transform: `scaleX(${progress})` }} />
          </div>
        </div>
      )}
      <form className="wishlist-add" onSubmit={addItem}>
        <label htmlFor="wishlist-new-item">Một điều muốn thêm</label>
        <div className="wishlist-add__row">
          <input id="wishlist-new-item" value={title} onChange={(event) => setTitle(event.target.value)} maxLength={120} required />
          <button type="submit" className="icon-action" aria-label="Thêm điều vào danh sách">
            <Plus size={18} aria-hidden />
          </button>
        </div>
      </form>
      {storageError && <p className="storage-message" role="status">{storageError}</p>}
      {items.length > 0 ? (
        <ul className="wishlist-list">
          {items.map((item) => (
            <li className={item.done ? 'is-done' : ''} key={item.id}>
              {editing?.id === item.id ? (
                <form className="wishlist-edit" onSubmit={saveEdit}>
                  <label className="visually-hidden" htmlFor={`wish-edit-${item.id}`}>Sửa điều muốn làm</label>
                  <input id={`wish-edit-${item.id}`} value={editing.title} onChange={(event) => setEditing({ ...editing, title: event.target.value })} maxLength={120} required />
                  <button type="submit" aria-label="Lưu thay đổi"><Check size={17} /></button>
                  <button type="button" aria-label="Hủy sửa" onClick={() => setEditing(null)}><X size={17} /></button>
                </form>
              ) : (
                <>
                  <label className="wishlist-item">
                    <input
                      type="checkbox"
                      checked={item.done}
                      onChange={(event) => setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, done: event.target.checked } : entry)))}
                    />
                    <span className="wishlist-check" aria-hidden><Check size={13} /></span>
                    <span>{item.title}</span>
                  </label>
                  <div className="wishlist-item__actions">
                    <button type="button" aria-label={`Sửa: ${item.title}`} onClick={() => setEditing({ id: item.id, title: item.title })}><Pencil size={15} /></button>
                    <button type="button" aria-label={`Xóa: ${item.title}`} onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}><Trash2 size={15} /></button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <div className="wishlist-empty">
          <span className="wishlist-empty__flower" aria-hidden>✿</span>
          <p>Danh sách chưa có mục nào.</p>
          <span>Thêm điều đầu tiên hai bạn muốn thử.</span>
        </div>
      )}
    </section>
  );
}

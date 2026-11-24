import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilePenLine, Inbox, LockKeyhole, Mail, MailCheck, Trash2 } from 'lucide-react';
import { LetterComposerDialog } from '@/components/LetterComposerDialog';
import { LetterReaderDialog } from '@/components/LetterReaderDialog';
import { formatPhotoDate } from '@/lib/imageFiles';
import type { CoupleIdentity, LoveLetter, SharedJournalRepository } from '@/lib/photoLetterRepository';
import { SupabaseSharedJournalRepository } from '@/lib/sharedJournalRepository';
import { supabase } from '@/lib/supabase';

type MailboxTab = 'received' | 'sent' | 'drafts';

const TABS: { id: MailboxTab; label: string }[] = [
  { id: 'received', label: 'Thư nhận được' },
  { id: 'sent', label: 'Đã gửi' },
  { id: 'drafts', label: 'Bản nháp' },
];

export function GuestLetterPreview({ onRequestSignIn }: { onRequestSignIn: (returnTo?: string) => void }) {
  return (
    <section id="corner" className="love-mailbox section-anchor guest-letter-preview" aria-labelledby="guest-letter-title">
      <header className="love-mailbox__intro">
        <div>
          <p className="section-kicker">Thư tay</p>
          <h2 id="guest-letter-title">Những lá thư</h2>
          <p>Một góc nhỏ để Phúc và Ánh gửi nhau những điều muốn nói.</p>
        </div>
        <button type="button" className="photo-button photo-button--quiet" disabled aria-disabled="true">
          <LockKeyhole size={16} aria-hidden /> Viết thư mới
        </button>
      </header>

      <div className="guest-letter-lock">
        <div className="guest-letter-envelopes" aria-hidden>
          <span className="guest-letter-envelope guest-letter-envelope--back"><Mail size={24} /></span>
          <span className="guest-letter-envelope guest-letter-envelope--front"><Mail size={27} /></span>
          <span className="guest-letter-envelope guest-letter-envelope--small"><Mail size={19} /></span>
          <span className="guest-letter-lock__seal"><LockKeyhole size={17} /></span>
        </div>
        <p className="section-kicker">Hộp thư riêng</p>
        <h3>Những lá thư này chỉ dành riêng cho Phúc và Ánh.</h3>
        <p>Đăng nhập để mở hộp thư và đọc thư đã gửi, đã nhận.</p>
        <button type="button" className="photo-button photo-button--primary" onClick={() => onRequestSignIn('corner')}>
          <LockKeyhole size={16} aria-hidden /> Đăng nhập để mở khóa
        </button>
      </div>
    </section>
  );
}

export function Letter({ identity }: { identity: CoupleIdentity }) {
  const [letters, setLetters] = useState<LoveLetter[]>([]);
  const [legacyLetters, setLegacyLetters] = useState<LoveLetter[]>([]);
  const [tab, setTab] = useState<MailboxTab>('received');
  const [loading, setLoading] = useState(true);
  const [storageError, setStorageError] = useState('');
  const [realtimeError, setRealtimeError] = useState('');
  const [notice, setNotice] = useState('');
  const [composing, setComposing] = useState<LoveLetter | null | undefined>(undefined);
  const [reading, setReading] = useState<LoveLetter | null>(null);
  const [importingId, setImportingId] = useState('');
  const repository = useMemo<SharedJournalRepository>(
    () => new SupabaseSharedJournalRepository(identity),
    [identity]
  );

  const loadLetters = useCallback(async () => {
    setLoading(true);
    try {
      const [sharedLetters, localLetters] = await Promise.all([
        repository.listLetters(),
        repository.listLegacyLocalLetters(),
      ]);
      setLetters(sharedLetters);
      setLegacyLetters(localLetters);
      setStorageError('');
    } catch (error) {
      console.error('Không tải được hộp thư chung.', error);
      setStorageError('Chưa tải được hộp thư. Kiểm tra kết nối rồi thử lại.');
    } finally {
      setLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    void loadLetters();
    const channel = supabase
      .channel(`couple-letters-${identity.userId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'love_letters' }, () => {
        void loadLetters();
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setRealtimeError('');
          void loadLetters();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeError('Cập nhật trực tiếp đang tạm ngắt. Tải lại hộp thư để kiểm tra thư mới.');
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [identity.userId, loadLetters]);

  useEffect(() => {
    const refreshWhenVisible = () => {
      if (document.visibilityState === 'visible') void loadLetters();
    };
    document.addEventListener('visibilitychange', refreshWhenVisible);
    return () => document.removeEventListener('visibilitychange', refreshWhenVisible);
  }, [loadLetters]);

  const visibleLetters = useMemo(() => {
    const filtered = letters.filter((letter) => {
      if (tab === 'received') return letter.recipientId === identity.userId && letter.status !== 'draft';
      if (tab === 'sent') return letter.senderId === identity.userId && letter.status !== 'draft';
      return letter.from === identity.name && letter.status === 'draft';
    });
    return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [letters, identity.userId, identity.name, tab]);

  const counts = useMemo(() => ({
    received: letters.filter((letter) => letter.recipientId === identity.userId && letter.status !== 'draft').length,
    sent: letters.filter((letter) => letter.senderId === identity.userId && letter.status !== 'draft').length,
    drafts: letters.filter((letter) => letter.from === identity.name && letter.status === 'draft').length,
  }), [letters, identity.userId, identity.name]);

  const saveDraft = async (letter: LoveLetter) => {
    const saved = await repository.saveDraft(letter);
    setLetters((current) => [saved, ...current.filter((item) => item.id !== saved.id)]);
    setNotice('Đã lưu bản nháp trên thiết bị này.');
    setTab('drafts');
  };

  const sendLetter = async (letter: LoveLetter) => {
    const sent = await repository.sendLetter(letter);
    await loadLetters();
    setNotice(`Đã gửi thư cho ${sent.to}. Thư đã nằm trong hộp thư chung.`);
    setTab('sent');
  };

  const markOpened = async (letter: LoveLetter) => {
    if (tab !== 'received' || letter.status === 'opened') return;
    const updated = await repository.markLetterOpened(letter.id);
    if (updated) {
      const opened = { ...updated, attachments: letter.attachments };
      setLetters((current) => current.map((item) => item.id === opened.id ? opened : item));
      setReading(opened);
    }
  };

  const deleteDraft = async (letter: LoveLetter) => {
    if (!window.confirm(`Xóa bản nháp “${letter.subject || 'Chưa có tiêu đề'}” khỏi thiết bị này?`)) return;
    try {
      await repository.deleteDraft(letter.id);
      setLetters((current) => current.filter((item) => item.id !== letter.id));
      setNotice('Đã xóa bản nháp khỏi thiết bị này.');
    } catch (error) {
      console.error('Không xóa được bản nháp.', error);
      setStorageError('Chưa xóa được bản nháp. Hãy thử lại.');
    }
  };

  const importLegacyLetter = async (letter: LoveLetter) => {
    if (!window.confirm(`Gửi bản sao “${letter.subject || 'Chưa có tiêu đề'}” vào hộp thư chung? Người nhận sẽ thấy thư này.`)) return;
    setImportingId(letter.id);
    setStorageError('');
    try {
      await repository.importLegacyLetter(letter);
      await loadLetters();
      setNotice('Đã chuyển thư cũ vào hộp thư chung.');
      setTab('sent');
    } catch (error) {
      console.error('Không chuyển được thư cũ vào hộp thư chung.', error);
      setStorageError('Chưa chuyển được thư. Bản cũ vẫn còn trên thiết bị này.');
    } finally {
      setImportingId('');
    }
  };

  const emptyTitle = tab === 'received'
    ? `Chưa có thư gửi cho ${identity.name}.`
    : tab === 'sent'
      ? 'Chưa có lá thư nào trong mục này.'
      : 'Chưa có bản nháp nào.';
  const emptyText = tab === 'received'
    ? 'Khi người còn lại gửi thư, thư sẽ xuất hiện ở đây.'
    : tab === 'sent'
      ? 'Những lá thư bạn gửi sẽ được lưu trong hộp thư chung.'
      : 'Bản nháp được lưu trên thiết bị này.';

  return (
    <section className="love-mailbox" aria-labelledby="love-mailbox-title">
      <header className="love-mailbox__intro">
        <div>
          <p className="section-kicker">Thư tay</p>
          <h2 id="love-mailbox-title">Những lá thư</h2>
          <p>Thư được gửi vào hộp thư riêng chung của Phúc và Ánh.</p>
        </div>
        <button
          type="button"
          className="photo-button photo-button--primary"
          onClick={() => setComposing(null)}
          disabled={Boolean(storageError) || !identity.partnerName}
        >
          <FilePenLine size={17} aria-hidden /> Viết thư mới
        </button>
      </header>

      {!identity.partnerName && (
        <p className="love-mailbox__error" role="status">
          Chưa thêm tài khoản của người còn lại. Thư sẽ được mở sau khi cả hai tài khoản được cấu hình.
        </p>
      )}

      <div className="love-mailbox__identity">
        <span>Hộp thư của</span>
        <strong>{identity.name}</strong>
      </div>

      <div className="love-mailbox__tabs" role="group" aria-label="Lọc thư">
        {TABS.map((item) => (
          <button
            type="button"
            aria-pressed={tab === item.id}
            key={item.id}
            onClick={() => { setTab(item.id); setNotice(''); }}
          >
            {item.label}<span>{counts[item.id]}</span>
          </button>
        ))}
      </div>

      <div className="love-mailbox__toolbar">
        <div>
          {tab === 'received' ? <Inbox size={18} aria-hidden /> : tab === 'sent' ? <MailCheck size={18} aria-hidden /> : <FilePenLine size={18} aria-hidden />}
          <span>{TABS.find((item) => item.id === tab)?.label} · {identity.name}</span>
        </div>
        <span>{visibleLetters.length} lá thư</span>
      </div>

      {notice && <p className="love-mailbox__notice" role="status">{notice}</p>}
      {realtimeError && <p className="love-mailbox__notice" role="status">{realtimeError}</p>}
      {storageError && (
        <div className="love-mailbox__error" role="alert">
          <p>{storageError}</p>
          <button type="button" className="photo-button photo-button--quiet" onClick={() => void loadLetters()}>Thử tải lại</button>
        </div>
      )}

      {legacyLetters.length > 0 && (
        <aside className="love-mailbox__legacy" aria-label="Thư cũ chỉ lưu trên thiết bị này">
          <div>
            <h3>Có {legacyLetters.length} thư cũ trên thiết bị này</h3>
            <p>Những thư này trước đây chưa được gửi khỏi trình duyệt. Chọn thư để gửi bản sao vào hộp thư chung.</p>
          </div>
          {legacyLetters.map((letter) => (
            <div className="love-mailbox__legacy-item" key={letter.id}>
              <span>{letter.subject || 'Chưa có tiêu đề'}</span>
              <button
                type="button"
                className="photo-button photo-button--quiet"
                onClick={() => void importLegacyLetter(letter)}
                disabled={Boolean(importingId) || !identity.partnerId}
              >
                {importingId === letter.id ? 'Đang chuyển…' : 'Gửi bản sao'}
              </button>
            </div>
          ))}
        </aside>
      )}

      <div id="letter-list" className={`love-letter-list love-letter-list--${tab}`} aria-live="polite">
        {loading ? (
          <p className="love-mailbox__empty">Đang mở hộp thư…</p>
        ) : visibleLetters.length > 0 ? visibleLetters.map((letter) => (
          <article className={`love-letter-card ${letter.status === 'opened' ? 'is-opened' : ''}`} key={letter.id}>
            <button
              type="button"
              className="love-letter-card__open"
              onClick={() => tab === 'drafts' ? setComposing(letter) : setReading(letter)}
              aria-label={tab === 'drafts' ? `Chỉnh sửa bản nháp ${letter.subject || 'chưa có tiêu đề'}` : `Mở thư ${letter.subject || 'chưa có tiêu đề'}, từ ${letter.from}`}
            >
              <span className="love-letter-card__envelope" aria-hidden>
                <span>{tab === 'drafts' ? <FilePenLine size={20} /> : <Mail size={20} />}</span>
              </span>
              <span className="love-letter-card__content">
                <span className="love-letter-card__address">
                  {tab === 'received' ? `Từ ${letter.from}` : tab === 'sent' ? `Gửi ${letter.to}` : `Gửi ${letter.to} · Bản nháp`}
                </span>
                <strong>{letter.subject || 'Chưa có tiêu đề'}</strong>
                <span className="love-letter-card__snippet">{letter.body || 'Chưa viết nội dung.'}</span>
                <span className="love-letter-card__date">{formatPhotoDate((letter.sentAt || letter.updatedAt).slice(0, 10))}</span>
              </span>
              <span className={`love-letter-card__state ${letter.status === 'opened' ? 'is-opened' : ''}`}>
                {tab === 'drafts'
                  ? 'Bản nháp'
                  : tab === 'sent'
                    ? letter.status === 'opened' ? 'Đã mở' : 'Đã gửi'
                    : letter.status === 'opened' ? 'Đã mở' : 'Chưa mở'}
              </span>
            </button>
            {tab === 'drafts' && (
              <button type="button" className="love-letter-card__delete" onClick={() => void deleteDraft(letter)} aria-label={`Xóa bản nháp ${letter.subject || 'chưa có tiêu đề'}`}>
                <Trash2 size={16} aria-hidden />
              </button>
            )}
          </article>
        )) : (
          <div className="love-mailbox__empty">
            <span className="love-mailbox__empty-mark" aria-hidden>✉</span>
            <h3>{emptyTitle}</h3>
            <p>{emptyText}</p>
          </div>
        )}
      </div>

      {composing !== undefined && identity.partnerName && (
        <LetterComposerDialog
          key={composing?.id ?? 'new-letter'}
          sender={identity.name}
          recipient={identity.partnerName}
          letter={composing ?? undefined}
          onClose={() => setComposing(undefined)}
          onSaveDraft={saveDraft}
          onSend={sendLetter}
        />
      )}
      {reading && (
        <LetterReaderDialog
          letter={reading}
          onClose={() => setReading(null)}
          onOpened={markOpened}
        />
      )}
    </section>
  );
}

import { supabase } from '@/lib/supabase';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;

export type MemoryRecord = {
  id: string;
  date: string | null;
  title: string;
  description: string | null;
  photo_url: string | null;
  ordering: number;
};

export type GalleryRecord = {
  id: string;
  storage_path: string;
  signed_url: string;
  caption: string | null;
  span: 'tall' | 'wide' | 'square' | 'big';
  ordering: number;
};

export type DiaryRecord = {
  id: string;
  storage_path: string;
  signed_url: string;
  caption: string | null;
  date: string | null;
  ordering: number;
};

export type NoteRecord = {
  id: string;
  title: string;
  body: string | null;
  ordering: number;
};

export type StoryRecord = {
  id: string;
  title: string;
  body: string | null;
  photo_url: string | null;
  ordering: number;
};

export type JournalData = {
  connected: boolean;
  memories: MemoryRecord[];
  gallery: GalleryRecord[];
  diary: DiaryRecord[];
  notes: NoteRecord[];
  stories: StoryRecord[];
  settings: Record<string, string>;
};

export const emptyJournalData: JournalData = {
  connected: false,
  memories: [],
  gallery: [],
  diary: [],
  notes: [],
  stories: [],
  settings: {},
};

export async function loadJournalData(): Promise<JournalData> {
  if (!supabase) return emptyJournalData;

  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 15_000);
  try {
    const [memories, gallery, diary, notes, stories, settings] = await Promise.all([
      supabase.from('memories').select('id,date,title,description,photo_url,ordering').order('ordering').limit(100).abortSignal(controller.signal),
      supabase.from('gallery_images').select('id,storage_path,caption,span,ordering').order('ordering').limit(200).abortSignal(controller.signal),
      supabase.from('diary_entries').select('id,storage_path,caption,date,ordering').order('ordering').limit(100).abortSignal(controller.signal),
      supabase.from('notes').select('id,title,body,ordering').order('ordering').limit(100).abortSignal(controller.signal),
      supabase.from('stories').select('id,title,body,photo_url,ordering').order('ordering').limit(100).abortSignal(controller.signal),
      supabase.from('site_settings').select('key,value').abortSignal(controller.signal),
    ]);

    const failed = [
      { table: 'memories', error: memories.error },
      { table: 'gallery_images', error: gallery.error },
      { table: 'diary_entries', error: diary.error },
      { table: 'notes', error: notes.error },
      { table: 'stories', error: stories.error },
      { table: 'site_settings', error: settings.error },
    ].find((entry) => entry.error);

    if (failed?.error) throw new Error(`Chưa tải được ${failed.table}: ${failed.error.message}`);

    const memoryRows = (memories.data ?? []) as MemoryRecord[];
    const galleryRows = (gallery.data ?? []) as Omit<GalleryRecord, 'signed_url'>[];
    const diaryRows = (diary.data ?? []) as Omit<DiaryRecord, 'signed_url'>[];
    const storyRows = (stories.data ?? []) as StoryRecord[];
    const storagePaths = [...new Set([
      ...galleryRows.map((row) => row.storage_path),
      ...diaryRows.map((row) => row.storage_path),
      ...memoryRows.map((row) => storagePathFromUrl(row.photo_url)).filter((path): path is string => Boolean(path)),
      ...storyRows.map((row) => storagePathFromUrl(row.photo_url)).filter((path): path is string => Boolean(path)),
    ].filter(Boolean))];
    const signedUrls = new Map<string, string>();
    if (storagePaths.length > 0) {
      const { data: signedEntries, error: signedError } = await supabase.storage
        .from('gallery')
        .createSignedUrls(storagePaths, 24 * 60 * 60);
      if (signedError) throw new Error(`Chưa tạo được liên kết riêng tư cho ảnh cũ: ${signedError.message}`);
      if (!signedEntries) throw new Error('Không nhận được liên kết riêng tư cho ảnh cũ.');
      for (const entry of signedEntries) {
        if (entry.error || !entry.path || !entry.signedUrl) {
          throw new Error(`Không mở được ảnh riêng tư "${entry.path ?? 'không rõ'}".`);
        }
        signedUrls.set(entry.path, entry.signedUrl);
      }
    }

    return {
      connected: true,
      memories: memoryRows.map((row) => {
        const path = storagePathFromUrl(row.photo_url);
        return path ? { ...row, photo_url: signedUrls.get(path) ?? null } : row;
      }),
      gallery: galleryRows.map((row) => ({ ...row, signed_url: signedUrls.get(row.storage_path) ?? '' })),
      diary: diaryRows.map((row) => ({ ...row, signed_url: signedUrls.get(row.storage_path) ?? '' })),
      notes: (notes.data ?? []) as NoteRecord[],
      stories: storyRows.map((row) => {
        const path = storagePathFromUrl(row.photo_url);
        return path ? { ...row, photo_url: signedUrls.get(path) ?? null } : row;
      }),
      settings: Object.fromEntries((settings.data ?? []).map(({ key, value }) => [key, value ?? ''])),
    };
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Tải dữ liệu My Love quá thời gian chờ. Hãy thử lại.');
    throw error;
  } finally {
    window.clearTimeout(timeout);
  }
}

function storagePathFromUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const projectUrl = new URL(SUPABASE_URL);
    const url = new URL(value, projectUrl);
    if (url.origin !== projectUrl.origin) return null;
    const marker = '/storage/v1/object/';
    const objectIndex = url.pathname.indexOf(marker);
    if (objectIndex < 0) return value.startsWith('/') ? null : value;
    const [visibility, bucket, ...segments] = url.pathname.slice(objectIndex + marker.length).split('/');
    if (!['public', 'sign', 'authenticated'].includes(visibility) || bucket !== 'gallery' || segments.length === 0) return null;
    return segments.map((segment) => decodeURIComponent(segment)).join('/');
  } catch {
    return null;
  }
}

export function imageSpace(storagePath: string): 'together' | 'phuc' | 'anh' | null {
  const prefix = storagePath.split('/')[0]?.toLocaleLowerCase('en');
  if (prefix === 'together' || prefix === 'phuc' || prefix === 'anh') return prefix;
  return null;
}

export function getLetterSettings(settings: Record<string, string>) {
  return {
    title: settings.letter_title?.trim() || 'Gửi Ánh',
    body: settings.letter_body?.trim() || settings.letter?.trim() || '',
    signature: settings.letter_signature?.trim() || '',
  };
}

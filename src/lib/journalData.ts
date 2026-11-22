import { supabase } from '@/lib/supabase';

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
  public_url: string;
  caption: string | null;
  span: 'tall' | 'wide' | 'square' | 'big';
  ordering: number;
};

export type DiaryRecord = {
  id: string;
  storage_path: string;
  public_url: string;
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
      supabase.from('gallery_images').select('id,storage_path,public_url,caption,span,ordering').order('ordering').limit(200).abortSignal(controller.signal),
      supabase.from('diary_entries').select('id,storage_path,public_url,caption,date,ordering').order('ordering').limit(100).abortSignal(controller.signal),
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

    return {
      connected: true,
      memories: (memories.data ?? []) as MemoryRecord[],
      gallery: (gallery.data ?? []) as GalleryRecord[],
      diary: (diary.data ?? []) as DiaryRecord[],
      notes: (notes.data ?? []) as NoteRecord[],
      stories: (stories.data ?? []) as StoryRecord[],
      settings: Object.fromEntries((settings.data ?? []).map(({ key, value }) => [key, value ?? ''])),
    };
  } catch (error) {
    if (controller.signal.aborted) throw new Error('Tải dữ liệu My Love quá thời gian chờ. Hãy thử lại.');
    throw error;
  } finally {
    window.clearTimeout(timeout);
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

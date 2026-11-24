import { supabase } from '@/lib/supabase';
import {
  photoLetterRepositoryFor,
  type CoupleIdentity,
  type GalleryImage,
  type LoveLetter,
  type PhotoLetterRepository,
  type SharedJournalRepository,
} from '@/lib/photoLetterRepository';

const PRIVATE_BUCKET = 'couple-private';
const MAX_FILE_SIZE = 50 * 1024 * 1024;
const SIGNED_URL_SECONDS = 24 * 60 * 60;
const LETTER_SELECT = 'id, sender_id, recipient_id, subject, body, signature, attachments, status, created_at, sent_at, opened_at, updated_at';

type CoupleIdentityRow = {
  user_id: string;
  display_name: string;
  partner_id: string | null;
  partner_name: string | null;
};

type GalleryRow = {
  id: string;
  album_id: GalleryImage['albumId'];
  storage_path: string;
  caption: string;
  photo_date: string | null;
  uploader_id: string;
  note: string;
  original_name: string;
  mime_type: string;
  file_size: number;
  is_cover: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

type StoredAttachment = {
  path: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
};

type LetterRow = {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  body: string;
  signature: string;
  attachments: StoredAttachment[];
  status: 'sent' | 'opened';
  created_at: string;
  sent_at: string;
  opened_at: string | null;
  updated_at: string;
};

type InsertedImage = Pick<GalleryRow, 'id' | 'storage_path'>;

function isCoupleName(value: string | null): value is NonNullable<CoupleIdentity['partnerName']> {
  return value === 'Phúc' || value === 'Ánh';
}

function createUuid() {
  if (!globalThis.crypto?.randomUUID) {
    throw new Error('Thiết bị chưa hỗ trợ tạo mã an toàn để tải ảnh lên.');
  }
  return globalThis.crypto.randomUUID();
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function fileExtension(fileName: string, mimeType: string) {
  const knownExtensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/avif': 'avif',
    'image/gif': 'gif',
  };
  if (knownExtensions[mimeType]) return knownExtensions[mimeType];

  const extension = fileName.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '');
  return extension && extension.length <= 8 ? extension : 'img';
}

function validateUpload(image: GalleryImage) {
  if (!image.blob) throw new Error(`Không còn dữ liệu ảnh "${image.fileName}" trên thiết bị.`);
  if (image.fileSize < 1 || image.fileSize > MAX_FILE_SIZE) {
    throw new Error(`Ảnh "${image.fileName}" vượt quá giới hạn 50 MB.`);
  }
  if (!image.mimeType.startsWith('image/') || image.mimeType.includes('svg')) {
    throw new Error(`Định dạng ảnh "${image.fileName}" không được hỗ trợ.`);
  }
}

export async function fetchCoupleIdentity(userId: string): Promise<CoupleIdentity> {
  const { data, error } = await supabase
    .rpc('get_couple_identity')
    .overrideTypes<CoupleIdentityRow[], { merge: false }>();
  if (error) throw error;
  if (!Array.isArray(data)) throw new Error('Phản hồi xác minh thành viên không hợp lệ.');
  const row = data.find((member: CoupleIdentityRow) => member.user_id === userId);
  if (!row || !isCoupleName(row.display_name)) {
    throw new Error('Tài khoản này chưa được cấp quyền vào nhật ký chung.');
  }

  const partnerName = row.partner_name;
  if (partnerName !== null && !isCoupleName(partnerName)) {
    throw new Error('Thông tin thành viên còn lại chưa hợp lệ.');
  }

  return {
    userId: row.user_id,
    name: row.display_name,
    partnerId: row.partner_id,
    partnerName,
  };
}

export class SupabaseSharedJournalRepository implements SharedJournalRepository {
  private readonly localRepository: PhotoLetterRepository;

  constructor(private readonly identity: CoupleIdentity) {
    this.localRepository = photoLetterRepositoryFor(identity.userId);
  }

  private requirePartner() {
    if (!this.identity.partnerId || !this.identity.partnerName) {
      throw new Error('Chưa thêm tài khoản của người còn lại vào danh sách thành viên.');
    }
    return { id: this.identity.partnerId, name: this.identity.partnerName };
  }

  private nameForUser(userId: string) {
    if (userId === this.identity.userId) return this.identity.name;
    if (userId === this.identity.partnerId && this.identity.partnerName) return this.identity.partnerName;
    throw new Error('Hộp thư chứa tài khoản không thuộc hai thành viên đã xác nhận.');
  }

  private async createSignedUrlMap(paths: string[]) {
    const uniquePaths = [...new Set(paths)];
    if (uniquePaths.length === 0) return new Map<string, string>();

    const { data, error } = await supabase.storage
      .from(PRIVATE_BUCKET)
      .createSignedUrls(uniquePaths, SIGNED_URL_SECONDS);
    if (error) throw error;
    if (!data) throw new Error('Không tạo được liên kết riêng tư cho tệp đính kèm.');

    const result = new Map<string, string>();
    for (const entry of data) {
      if (entry.error || !entry.path || !entry.signedUrl) {
        throw new Error(`Không mở được tệp riêng tư "${entry.path ?? 'không rõ'}".`);
      }
      result.set(entry.path, entry.signedUrl);
    }
    return result;
  }

  private async cleanupStorage(paths: string[], imageIds: string[] = []) {
    for (const id of imageIds) {
      const { error } = await supabase.rpc('delete_couple_gallery_image', { p_image_id: id });
      if (error) console.error('Không dọn được metadata ảnh sau thao tác tải lên lỗi.', error);
    }
    if (paths.length === 0) return;
    const { error } = await supabase.storage.from(PRIVATE_BUCKET).remove(paths);
    if (error) console.error('Không dọn được tệp riêng tư sau thao tác tải lên lỗi.', error);
  }

  async listSharedPhotos(): Promise<GalleryImage[]> {
    const { data, error } = await supabase
      .from('couple_gallery_images')
      .select('id, album_id, storage_path, caption, photo_date, uploader_id, note, original_name, mime_type, file_size, is_cover, sort_order, created_at, updated_at')
      .order('created_at', { ascending: false })
      .order('sort_order', { ascending: true })
      .returns<GalleryRow[]>();
    if (error) throw error;
    if (!data?.length) return [];

    const signedUrls = await this.createSignedUrlMap(data.map((image) => image.storage_path));
    return data.map((image) => ({
      id: image.id,
      albumId: image.album_id,
      fileName: image.original_name,
      fileSize: image.file_size,
      mimeType: image.mime_type,
      caption: image.caption,
      date: image.photo_date ?? '',
      uploader: this.nameForUser(image.uploader_id),
      note: image.note,
      createdAt: image.created_at,
      updatedAt: image.updated_at,
      storagePath: image.storage_path,
      signedUrl: signedUrls.get(image.storage_path),
      ownerId: image.uploader_id,
      isCover: image.is_cover,
      sortOrder: image.sort_order,
    }));
  }

  async uploadPhotos(images: GalleryImage[], coverSourceId: string) {
    if (images.length === 0) throw new Error('Chọn ít nhất một ảnh để tiếp tục.');
    const albumId = images[0].albumId;
    if (images.some((image) => image.albumId !== albumId)) {
      throw new Error('Mỗi lần tải ảnh chỉ được chọn một album.');
    }
    if (!images.some((image) => image.id === coverSourceId)) {
      throw new Error('Chọn một ảnh bìa trong danh sách trước khi tải lên.');
    }

    const remoteIds = images.map((image) => isUuid(image.id) ? image.id : createUuid());
    const coverRemoteId = remoteIds[images.findIndex((image) => image.id === coverSourceId)];
    const { data: existingImages, error: existingError } = await supabase
      .from('couple_gallery_images')
      .select('id, uploader_id')
      .in('id', remoteIds)
      .returns<Array<{ id: string; uploader_id: string }>>();
    if (existingError) throw existingError;
    if (existingImages?.length) {
      if (existingImages.length !== remoteIds.length || existingImages.some((image) => image.uploader_id !== this.identity.userId)) {
        throw new Error('Một phần ảnh đã tồn tại trong album; hãy tải lại trang trước khi tiếp tục.');
      }
      const { error: coverError } = await supabase.rpc('set_couple_gallery_cover', {
        p_album_id: albumId,
        p_image_id: coverRemoteId,
      });
      if (coverError) throw coverError;
      return;
    }

    const uploadedPaths: string[] = [];
    let insertedIds: string[] = [];
    let insertInFlight = false;
    try {
      const records = [];
      const idBySourceId = new Map<string, string>();

      for (const [index, image] of images.entries()) {
        validateUpload(image);
        const id = remoteIds[index];
        const path = `photos/${image.albumId}/${this.identity.userId}/${id}.${fileExtension(image.fileName, image.mimeType)}`;
        uploadedPaths.push(path);
        const { error: uploadError } = await supabase.storage.from(PRIVATE_BUCKET).upload(path, image.blob!, {
          cacheControl: '3600',
          contentType: image.mimeType,
          upsert: false,
        });
        if (uploadError) throw uploadError;
        idBySourceId.set(image.id, id);
        records.push({
          id,
          album_id: image.albumId,
          storage_path: path,
          caption: image.caption.trim(),
          photo_date: image.date || null,
          uploader_id: this.identity.userId,
          note: image.note.trim(),
          original_name: image.fileName.slice(0, 255),
          mime_type: image.mimeType,
          file_size: image.fileSize,
          is_cover: false,
          sort_order: image.sortOrder ?? index,
        });
      }

      insertInFlight = true;
      const { data, error } = await supabase
        .from('couple_gallery_images')
        .insert(records)
        .select('id, storage_path')
        .returns<InsertedImage[]>();
      insertInFlight = false;
      if (error) throw error;
      if (!data || data.length !== records.length) {
        throw new Error('Không xác nhận được toàn bộ ảnh đã lưu vào album chung.');
      }
      insertedIds = data.map((image) => image.id);

      const coverId = idBySourceId.get(coverSourceId);
      if (!coverId) throw new Error('Không xác định được ảnh bìa vừa tải lên.');
      const { error: coverError } = await supabase.rpc('set_couple_gallery_cover', {
        p_album_id: albumId,
        p_image_id: coverId,
      });
      if (coverError) throw coverError;
    } catch (error) {
      if (insertInFlight) {
        console.error('Chưa xác nhận được kết quả lưu ảnh; giữ lại tệp để có thể khôi phục khi thử lại.', error);
      } else {
        await this.cleanupStorage(uploadedPaths, insertedIds);
      }
      throw error;
    }
  }

  async updateSharedPhoto(image: GalleryImage) {
    if (!image.storagePath || image.ownerId !== this.identity.userId) {
      throw new Error('Bạn chỉ có thể chỉnh sửa ảnh do mình đăng.');
    }
    const { error } = await supabase.rpc('update_couple_gallery_image', {
      p_image_id: image.id,
      p_album_id: image.albumId,
      p_caption: image.caption.trim(),
      p_photo_date: image.date || null,
      p_note: image.note.trim(),
    });
    if (error) throw error;
  }

  async deleteSharedPhoto(image: GalleryImage) {
    if (!image.storagePath || image.ownerId !== this.identity.userId) {
      throw new Error('Bạn chỉ có thể xóa ảnh do mình đăng.');
    }
    const { data, error: deleteError } = await supabase
      .rpc('delete_couple_gallery_image', { p_image_id: image.id })
      .overrideTypes<string, { merge: false }>();
    if (deleteError) throw deleteError;
    const path = typeof data === 'string' ? data : '';
    if (!path) throw new Error('Không nhận được đường dẫn ảnh cần xóa.');

    const { error: storageError } = await supabase.storage.from(PRIVATE_BUCKET).remove([path]);
    if (storageError) {
      console.error('Không dọn được tệp riêng tư sau khi xóa metadata ảnh.', storageError);
      throw new Error('Ảnh đã được gỡ khỏi album nhưng tệp riêng tư chưa được dọn. Quản trị viên cần kiểm tra Storage.');
    }
  }

  async listLetters(): Promise<LoveLetter[]> {
    const [{ data, error }, localLetters] = await Promise.all([
      supabase
        .from('love_letters')
      .select(LETTER_SELECT)
        .order('sent_at', { ascending: false })
        .returns<LetterRow[]>(),
      this.localRepository.listLetters(),
    ]);
    if (error) throw error;

    const rows = data ?? [];
    const signedUrls = await this.createSignedUrlMap(
      rows.flatMap((letter) => letter.attachments.map((attachment) => attachment.path))
    );
    const sharedLetters = rows.map((letter) => this.mapLetter(letter, signedUrls));
    const drafts = localLetters.filter((letter) => letter.status === 'draft' && letter.from === this.identity.name);
    return [...drafts, ...sharedLetters];
  }

  async listLegacyLocalLetters() {
    const letters = await this.localRepository.listLetters();
    return letters.filter((letter) => letter.status !== 'draft' && letter.from === this.identity.name);
  }

  async saveDraft(letter: LoveLetter) {
    const recipient = this.identity.partnerName ?? letter.to;
    const draft: LoveLetter = {
      ...letter,
      from: this.identity.name,
      to: recipient,
      status: 'draft',
      updatedAt: new Date().toISOString(),
    };
    await this.localRepository.saveLetter(draft);
    return draft;
  }

  async deleteDraft(id: string) {
    await this.localRepository.deleteLetter(id);
  }

  private async findLegacyLetter(sourceId: string) {
    const { data, error } = await supabase
      .from('love_letters')
      .select(LETTER_SELECT)
      .eq('sender_id', this.identity.userId)
      .eq('legacy_source_id', sourceId)
      .maybeSingle()
      .returns<LetterRow | null>();
    if (error) throw error;
    return data;
  }

  async sendLetter(letter: LoveLetter, legacySourceId?: string): Promise<LoveLetter> {
    const partner = this.requirePartner();
    const sourceId = legacySourceId ?? (letter.status === 'draft' ? letter.id : undefined);
    const subject = letter.subject.trim();
    const body = letter.body.trim();
    if (!subject || !body) throw new Error('Thư cần có tiêu đề và nội dung.');
    if (subject.length > 140 || body.length > 20000 || letter.signature.length > 100) {
      throw new Error('Một trường trong thư đã vượt quá độ dài cho phép.');
    }
    if (sourceId) {
      const existing = await this.findLegacyLetter(sourceId);
      if (existing) return this.mapLetter(existing);
    }

    const id = createUuid();
    const uploadedPaths: string[] = [];
    let cleanupDone = false;
    let insertInFlight = false;
    try {
      const attachments: StoredAttachment[] = [];
      for (const attachment of letter.attachments) {
        if (!attachment.blob) {
          throw new Error(`Không còn ảnh đính kèm "${attachment.fileName}" trên thiết bị.`);
        }
        if (attachment.fileSize < 1 || attachment.fileSize > MAX_FILE_SIZE) {
          throw new Error(`Ảnh đính kèm "${attachment.fileName}" vượt quá giới hạn 50 MB.`);
        }
        if (!attachment.mimeType.startsWith('image/') || attachment.mimeType.includes('svg')) {
          throw new Error(`Định dạng ảnh đính kèm "${attachment.fileName}" không được hỗ trợ.`);
        }

        const path = `letters/${this.identity.userId}/${id}/${createUuid()}.${fileExtension(attachment.fileName, attachment.mimeType)}`;
        uploadedPaths.push(path);
        const { error: uploadError } = await supabase.storage.from(PRIVATE_BUCKET).upload(path, attachment.blob, {
          cacheControl: '3600',
          contentType: attachment.mimeType,
          upsert: false,
        });
        if (uploadError) throw uploadError;
        attachments.push({
          path,
          fileName: attachment.fileName.slice(0, 255),
          fileSize: attachment.fileSize,
          mimeType: attachment.mimeType,
        });
      }

      insertInFlight = true;
      const { data, error } = await supabase
        .from('love_letters')
        .insert({
          id,
          sender_id: this.identity.userId,
          recipient_id: partner.id,
          legacy_source_id: sourceId ?? null,
          subject,
          body,
          signature: letter.signature.trim(),
          attachments,
        })
        .select(LETTER_SELECT)
        .single()
        .returns<LetterRow>();
      insertInFlight = false;
      if (error) {
        if (sourceId && error.code === '23505') {
          await this.cleanupStorage(uploadedPaths);
          cleanupDone = true;
          const existing = await this.findLegacyLetter(sourceId);
          if (existing) return this.mapLetter(existing);
        }
        throw error;
      }

      if (letter.status === 'draft') {
        try {
          await this.localRepository.deleteLetter(letter.id);
        } catch (cleanupError) {
          console.error('Thư đã gửi nhưng chưa xóa được bản nháp cũ trên thiết bị.', cleanupError);
        }
      }

      return this.mapLetter(data);
    } catch (error) {
      if (uploadedPaths.length > 0 && !cleanupDone) {
        if (insertInFlight) {
          console.error('Chưa xác nhận được kết quả gửi thư; giữ lại ảnh để có thể khôi phục khi thử lại.', error);
        } else {
          const { error: cleanupError } = await supabase.storage.from(PRIVATE_BUCKET).remove(uploadedPaths);
          if (cleanupError) console.error('Không dọn được ảnh đính kèm sau khi gửi thư lỗi.', cleanupError);
        }
      }
      throw error;
    }
  }

  async importLegacyLetter(letter: LoveLetter) {
    const sent = await this.sendLetter({ ...letter, status: 'sent' }, letter.id);
    try {
      await this.localRepository.deleteLetter(letter.id);
    } catch (error) {
      console.error('Thư đã nằm trong hộp thư chung nhưng chưa xóa được bản cũ trên thiết bị.', error);
    }
    return sent;
  }

  async markLetterOpened(id: string): Promise<LoveLetter | null> {
    const { data, error } = await supabase
      .from('love_letters')
      .update({ status: 'opened', opened_at: new Date().toISOString() })
      .eq('id', id)
      .eq('recipient_id', this.identity.userId)
      .select(LETTER_SELECT)
      .maybeSingle()
      .returns<LetterRow | null>();
    if (error) throw error;
    return data ? this.mapLetter(data) : null;
  }

  private mapLetter(row: LetterRow, signedUrls = new Map<string, string>()): LoveLetter {
    return {
      id: row.id,
      from: this.nameForUser(row.sender_id),
      to: this.nameForUser(row.recipient_id),
      subject: row.subject,
      body: row.body,
      signature: row.signature,
      attachments: row.attachments.map((attachment) => ({
        id: attachment.path,
        storagePath: attachment.path,
        url: signedUrls.get(attachment.path),
        fileName: attachment.fileName,
        fileSize: attachment.fileSize,
        mimeType: attachment.mimeType,
      })),
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      senderId: row.sender_id,
      recipientId: row.recipient_id,
      sentAt: row.sent_at,
      ...(row.opened_at ? { openedAt: row.opened_at } : {}),
    };
  }
}

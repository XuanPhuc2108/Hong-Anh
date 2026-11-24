export type GalleryAlbumId = 'together' | 'phuc' | 'anh';
export type CoupleName = 'Phúc' | 'Ánh';

export interface CoupleIdentity {
  userId: string;
  name: CoupleName;
  partnerId: string | null;
  partnerName: CoupleName | null;
}

export interface GalleryAlbum {
  id: GalleryAlbumId;
  title: string;
  subtitle: string;
  description: string;
  owner: CoupleName | 'Cả hai';
  style: 'scrapbook' | 'journal' | 'botanical';
  coverPhotoId?: string;
}

export interface GalleryImage {
  id: string;
  albumId: GalleryAlbumId;
  blob?: Blob;
  fileName: string;
  fileSize: number;
  mimeType: string;
  caption: string;
  date: string;
  uploader: CoupleName;
  note: string;
  createdAt: string;
  updatedAt: string;
  storagePath?: string;
  signedUrl?: string;
  ownerId?: string;
  isCover?: boolean;
  sortOrder?: number;
}

export interface LetterAttachment {
  id: string;
  blob?: Blob;
  fileName: string;
  fileSize: number;
  mimeType: string;
  storagePath?: string;
  url?: string;
}

export type LoveLetterStatus = 'draft' | 'sent' | 'opened';

export interface LoveLetter {
  id: string;
  from: CoupleName;
  to: CoupleName;
  subject: string;
  body: string;
  signature: string;
  attachments: LetterAttachment[];
  status: LoveLetterStatus;
  createdAt: string;
  updatedAt: string;
  senderId?: string;
  recipientId?: string;
  sentAt?: string;
  openedAt?: string;
}

export interface PhotoLetterRepository {
  listAlbums(): Promise<GalleryAlbum[]>;
  saveAlbum(album: GalleryAlbum): Promise<void>;
  listPhotos(): Promise<GalleryImage[]>;
  addPhotos(images: GalleryImage[], coverPhotoId: string): Promise<void>;
  updatePhoto(image: GalleryImage): Promise<void>;
  deletePhoto(id: string): Promise<void>;
  listLetters(): Promise<LoveLetter[]>;
  saveLetter(letter: LoveLetter): Promise<void>;
  markLetterOpened(id: string): Promise<LoveLetter | null>;
  deleteLetter(id: string): Promise<void>;
}

export interface SharedJournalRepository {
  listSharedPhotos(): Promise<GalleryImage[]>;
  uploadPhotos(images: GalleryImage[], coverSourceId: string): Promise<void>;
  updateSharedPhoto(image: GalleryImage): Promise<void>;
  deleteSharedPhoto(image: GalleryImage): Promise<void>;
  listLetters(): Promise<LoveLetter[]>;
  listLegacyLocalLetters(): Promise<LoveLetter[]>;
  saveDraft(letter: LoveLetter): Promise<LoveLetter>;
  deleteDraft(id: string): Promise<void>;
  sendLetter(letter: LoveLetter, legacySourceId?: string): Promise<LoveLetter>;
  importLegacyLetter(letter: LoveLetter): Promise<LoveLetter>;
  markLetterOpened(id: string): Promise<LoveLetter | null>;
}

export const GALLERY_ALBUMS: GalleryAlbum[] = [
  {
    id: 'together',
    title: 'Tụi mình',
    subtitle: 'Những ngày ở cạnh nhau',
    description: 'Ảnh chụp chung, chuyến đi và những dịp muốn nhớ lâu hơn.',
    owner: 'Cả hai',
    style: 'scrapbook',
  },
  {
    id: 'phuc',
    title: 'Góc của Phúc',
    subtitle: 'Qua mắt Phúc',
    description: 'Những khung hình và câu chuyện Phúc muốn giữ lại.',
    owner: 'Phúc',
    style: 'journal',
  },
  {
    id: 'anh',
    title: 'Góc của Ánh',
    subtitle: 'Qua mắt Ánh',
    description: 'Những điều Ánh muốn cất riêng trong album này.',
    owner: 'Ánh',
    style: 'botanical',
  },
];

const DATABASE_NAME = 'my-love-local-content';
const DATABASE_VERSION = 1;
const PHOTO_STORE = 'photos';
const ALBUM_STORE = 'albums';
const LETTER_STORE = 'letters';

export function createLocalId() {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export class IndexedDbPhotoLetterRepository implements PhotoLetterRepository {
  private databasePromise: Promise<IDBDatabase> | null = null;
  constructor(private readonly databaseName = DATABASE_NAME) {}

  private openDatabase() {
    if (this.databasePromise) return this.databasePromise;
    if (typeof indexedDB === 'undefined') {
      return Promise.reject(new Error('Trình duyệt này không hỗ trợ lưu ảnh trên thiết bị.'));
    }

    this.databasePromise = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(this.databaseName, DATABASE_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        if (!database.objectStoreNames.contains(PHOTO_STORE)) {
          const photos = database.createObjectStore(PHOTO_STORE, { keyPath: 'id' });
          photos.createIndex('albumId', 'albumId', { unique: false });
        }
        if (!database.objectStoreNames.contains(ALBUM_STORE)) {
          database.createObjectStore(ALBUM_STORE, { keyPath: 'id' });
        }
        if (!database.objectStoreNames.contains(LETTER_STORE)) {
          const letters = database.createObjectStore(LETTER_STORE, { keyPath: 'id' });
          letters.createIndex('from', 'from', { unique: false });
          letters.createIndex('to', 'to', { unique: false });
          letters.createIndex('status', 'status', { unique: false });
        }
      };
      request.onsuccess = () => {
        this.databasePromise = Promise.resolve(request.result);
        resolve(request.result);
      };
      request.onerror = () => {
        this.databasePromise = null;
        reject(request.error ?? new Error('Không mở được kho lưu trữ trên thiết bị.'));
      };
      request.onblocked = () => {
        this.databasePromise = null;
        reject(new Error('Kho lưu trữ đang được dùng ở một thẻ khác. Hãy tải lại trang đó rồi thử lại.'));
      };
    });
    return this.databasePromise;
  }

  private async transact<T>(
    storeNames: string[],
    mode: IDBTransactionMode,
    operation: (transaction: IDBTransaction, setResult: (value: T) => void) => void
  ): Promise<T> {
    const database = await this.openDatabase();
    return new Promise<T>((resolve, reject) => {
      const transaction = database.transaction(storeNames, mode);
      let result: T;
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error ?? new Error('Không lưu được dữ liệu trên thiết bị.'));
      transaction.onabort = () => reject(transaction.error ?? new Error('Đã hủy thao tác lưu trên thiết bị.'));
      try {
        operation(transaction, (value) => {
          result = value;
        });
      } catch (error) {
        transaction.abort();
        reject(error);
      }
    });
  }

  async listAlbums() {
    const stored = await this.transact<GalleryAlbum[]>([ALBUM_STORE], 'readonly', (transaction, setResult) => {
      const request = transaction.objectStore(ALBUM_STORE).getAll() as IDBRequest<GalleryAlbum[]>;
      request.onsuccess = () => setResult(request.result);
    });
    return GALLERY_ALBUMS.map((album) => ({
      ...album,
      ...stored.find((entry) => entry.id === album.id),
    }));
  }

  saveAlbum(album: GalleryAlbum) {
    return this.transact<void>([ALBUM_STORE], 'readwrite', (transaction, setResult) => {
      transaction.objectStore(ALBUM_STORE).put(album);
      setResult(undefined);
    });
  }

  listPhotos() {
    return this.transact<GalleryImage[]>([PHOTO_STORE], 'readonly', (transaction, setResult) => {
      const request = transaction.objectStore(PHOTO_STORE).getAll() as IDBRequest<GalleryImage[]>;
      request.onsuccess = () => setResult(request.result);
    });
  }

  addPhotos(images: GalleryImage[], coverPhotoId: string) {
    return this.transact<void>([PHOTO_STORE, ALBUM_STORE], 'readwrite', (transaction, setResult) => {
      const photos = transaction.objectStore(PHOTO_STORE);
      const albums = transaction.objectStore(ALBUM_STORE);
      images.forEach((image) => photos.put(image));
      const album = GALLERY_ALBUMS.find((entry) => entry.id === images[0]?.albumId);
      if (album) {
        const request = albums.get(album.id) as IDBRequest<GalleryAlbum | undefined>;
        request.onsuccess = () => {
          albums.put({ ...album, ...request.result, coverPhotoId });
        };
      }
      setResult(undefined);
    });
  }

  updatePhoto(image: GalleryImage) {
    return this.transact<void>([PHOTO_STORE, ALBUM_STORE], 'readwrite', (transaction, setResult) => {
      const photos = transaction.objectStore(PHOTO_STORE);
      const albums = transaction.objectStore(ALBUM_STORE);
      const existingRequest = photos.get(image.id) as IDBRequest<GalleryImage | undefined>;
      existingRequest.onsuccess = () => {
        const existing = existingRequest.result;
        photos.put(image);
        if (existing && existing.albumId !== image.albumId) {
          const oldAlbumRequest = albums.get(existing.albumId) as IDBRequest<GalleryAlbum | undefined>;
          oldAlbumRequest.onsuccess = () => {
            const oldAlbum = oldAlbumRequest.result;
            if (oldAlbum?.coverPhotoId !== image.id) return;
            const remainingRequest = photos.index('albumId').getAll(existing.albumId) as IDBRequest<GalleryImage[]>;
            remainingRequest.onsuccess = () => {
              albums.put({ ...oldAlbum, coverPhotoId: remainingRequest.result[0]?.id });
            };
          };
        }
      };
      setResult(undefined);
    });
  }

  deletePhoto(id: string) {
    return this.transact<void>([PHOTO_STORE, ALBUM_STORE], 'readwrite', (transaction, setResult) => {
      const photos = transaction.objectStore(PHOTO_STORE);
      const albums = transaction.objectStore(ALBUM_STORE);
      const imageRequest = photos.get(id) as IDBRequest<GalleryImage | undefined>;
      imageRequest.onsuccess = () => {
        const image = imageRequest.result;
        photos.delete(id);
        if (!image) return;
        const albumRequest = albums.get(image.albumId) as IDBRequest<GalleryAlbum | undefined>;
        albumRequest.onsuccess = () => {
          const album = albumRequest.result;
          if (album?.coverPhotoId !== id) return;
          const remainingRequest = photos.index('albumId').getAll(image.albumId) as IDBRequest<GalleryImage[]>;
          remainingRequest.onsuccess = () => {
            albums.put({ ...album, coverPhotoId: remainingRequest.result[0]?.id });
          };
        };
      };
      setResult(undefined);
    });
  }

  listLetters() {
    return this.transact<LoveLetter[]>([LETTER_STORE], 'readonly', (transaction, setResult) => {
      const request = transaction.objectStore(LETTER_STORE).getAll() as IDBRequest<LoveLetter[]>;
      request.onsuccess = () => setResult(request.result);
    });
  }

  saveLetter(letter: LoveLetter) {
    return this.transact<void>([LETTER_STORE], 'readwrite', (transaction, setResult) => {
      transaction.objectStore(LETTER_STORE).put(letter);
      setResult(undefined);
    });
  }

  async markLetterOpened(id: string) {
    return this.transact<LoveLetter | null>([LETTER_STORE], 'readwrite', (transaction, setResult) => {
      const store = transaction.objectStore(LETTER_STORE);
      const request = store.get(id) as IDBRequest<LoveLetter | undefined>;
      request.onsuccess = () => {
        if (!request.result) {
          setResult(null);
          return;
        }
        const opened = { ...request.result, status: 'opened' as const, openedAt: new Date().toISOString() };
        store.put(opened);
        setResult(opened);
      };
    });
  }

  deleteLetter(id: string) {
    return this.transact<void>([LETTER_STORE], 'readwrite', (transaction, setResult) => {
      transaction.objectStore(LETTER_STORE).delete(id);
      setResult(undefined);
    });
  }
}

export const photoLetterRepository: PhotoLetterRepository = new IndexedDbPhotoLetterRepository();

export function photoLetterRepositoryFor(userId: string): PhotoLetterRepository {
  if (!userId.trim()) throw new Error('Thiếu mã thành viên để mở dữ liệu cục bộ.');
  return new IndexedDbPhotoLetterRepository(`${DATABASE_NAME}:${userId}`);
}

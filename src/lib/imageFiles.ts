const MAX_IMAGE_SIZE_BYTES = 50 * 1024 * 1024;
const MIME_TYPES_BY_EXTENSION: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
  avif: 'image/avif',
  gif: 'image/gif',
  heic: 'image/heic',
  heif: 'image/heif',
};

export async function findReadableImages(files: File[]) {
  const accepted: File[] = [];
  const rejected: string[] = [];

  for (const file of files) {
    if (file.size < 1 || file.size > MAX_IMAGE_SIZE_BYTES || file.type.includes('svg') || /\.svg$/i.test(file.name)) {
      rejected.push(file.name);
      continue;
    }
    const url = URL.createObjectURL(file);
    const readable = await new Promise<boolean>((resolve) => {
      const image = new Image();
      image.onload = () => resolve(true);
      image.onerror = () => resolve(false);
      image.src = url;
    }).finally(() => URL.revokeObjectURL(url));

    if (readable) accepted.push(file);
    else rejected.push(file.name);
  }

  return { accepted, rejected };
}

export function getImageMimeType(file: Pick<File, 'type' | 'name'>) {
  if (file.type.startsWith('image/')) return file.type;
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
  return MIME_TYPES_BY_EXTENSION[extension] ?? 'image/unknown';
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatPhotoDate(date: string) {
  if (!date) return '';
  const value = new Date(`${date}T12:00:00`);
  return Number.isNaN(value.getTime())
    ? date
    : new Intl.DateTimeFormat('vi-VN', { day: 'numeric', month: 'long', year: 'numeric' }).format(value);
}

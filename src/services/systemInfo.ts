import { Filesystem, Directory } from '@capacitor/filesystem';

export interface ScanFileInfo {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'folder';
  modified: Date;
}

export interface CategoryFiles {
  name: string;
  icon: string;
  files: ScanFileInfo[];
  totalSize: number;
}

export const getRealFiles = async (basePath: string = ''): Promise<ScanFileInfo[]> => {
  try {
    const cleanPath = basePath.replace(/^\/+/, '');
    const result = await Filesystem.readdir({
      path: cleanPath,
      directory: Directory.ExternalStorage,
    });

    const files: ScanFileInfo[] = await Promise.all(
      result.files.map(async (file) => {
        let size = 0;
        let modified = new Date();

        if (file.type === 'file') {
          try {
            const filePath = cleanPath ? `${cleanPath}/${file.name}` : file.name;
            const stat = await Filesystem.stat({
              path: filePath,
              directory: Directory.ExternalStorage,
            });
            size = stat.size || 0;
            modified = stat.mtime ? new Date(stat.mtime) : new Date();
          } catch {
            size = 0;
          }
        }

        return {
          name: file.name,
          path: basePath ? `${basePath}/${file.name}` : `/${file.name}`,
          size,
          type: file.type as 'file' | 'folder',
          modified,
        };
      })
    );

    return files;
  } catch {
    return [];
  }
};

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg', 'heic', 'heif'];
const VIDEO_EXTS = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm', '3gp', 'm4v'];
const AUDIO_EXTS = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a', 'wma', 'opus'];
const DOC_EXTS = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'md', 'csv', 'json', 'xml', 'html'];
const ARCHIVE_EXTS = ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'];

function categorizeFile(file: ScanFileInfo): string | null {
  if (file.type !== 'file') return null;
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  if (IMAGE_EXTS.includes(ext)) return 'image';
  if (VIDEO_EXTS.includes(ext)) return 'video';
  if (AUDIO_EXTS.includes(ext)) return 'audio';
  if (DOC_EXTS.includes(ext)) return 'document';
  if (ext === 'apk') return 'apk';
  if (ARCHIVE_EXTS.includes(ext)) return 'archive';
  return 'other';
}

export const scanFilesByCategory = async (): Promise<Record<string, CategoryFiles>> => {
  const categories: Record<string, CategoryFiles> = {
    image: { name: '图片', icon: 'image', files: [], totalSize: 0 },
    video: { name: '视频', icon: 'video', files: [], totalSize: 0 },
    audio: { name: '音乐', icon: 'audio', files: [], totalSize: 0 },
    document: { name: '文档', icon: 'document', files: [], totalSize: 0 },
    apk: { name: '应用', icon: 'apk', files: [], totalSize: 0 },
    archive: { name: '压缩包', icon: 'archive', files: [], totalSize: 0 },
    other: { name: '其他', icon: 'other', files: [], totalSize: 0 },
  };

  const SKIP_DIRS = new Set(['Android', 'lost+found', '.thumbnails', '.cache']);

  const addFile = (file: ScanFileInfo) => {
    const cat = categorizeFile(file);
    if (cat && categories[cat]) {
      categories[cat].files.push(file);
      categories[cat].totalSize += file.size;
    }
  };

  const scanOneLevel = async (dirPath: string) => {
    try {
      const files = await getRealFiles(dirPath);
      for (const item of files) {
        if (item.type === 'file') {
          addFile(item);
        }
      }
      return files;
    } catch {
      return [];
    }
  };

  const items = await scanOneLevel('');
  for (const item of items) {
    if (item.type === 'folder' && !item.name.startsWith('.') && !SKIP_DIRS.has(item.name)) {
      await scanOneLevel(item.path);
    }
  }

  return categories;
};

export const getStorageBreakdown = async (): Promise<{ name: string; value: number; color: string }[]> => {
  try {
    const categories = await scanFilesByCategory();
    return [
      { name: '图片', value: categories.image.totalSize, color: '#FF6B6B' },
      { name: '视频', value: categories.video.totalSize, color: '#4ECDC4' },
      { name: '音乐', value: categories.audio.totalSize, color: '#45B7D1' },
      { name: '文档', value: categories.document.totalSize, color: '#96CEB4' },
      { name: '应用', value: categories.apk.totalSize, color: '#45B7D1' },
      { name: '压缩', value: categories.archive.totalSize, color: '#FFEAA7' },
      { name: '其他', value: categories.other.totalSize, color: '#DFE6E9' },
    ];
  } catch {
    return [];
  }
};

export const scanLargeFiles = async (minSize: number = 100 * 1024 * 1024): Promise<ScanFileInfo[]> => {
  const largeFiles: ScanFileInfo[] = [];
  const scannedPaths = new Set<string>();

  const scanDirectory = async (path: string) => {
    if (scannedPaths.has(path)) return;
    scannedPaths.add(path);

    try {
      const files = await getRealFiles(path);
      for (const file of files) {
        if (file.type === 'file' && file.size >= minSize) {
          largeFiles.push(file);
        } else if (file.type === 'folder' && !path.includes('Android/data')) {
          await scanDirectory(file.path);
        }
      }
    } catch {
      // Cannot scan
    }
  };

  await scanDirectory('');
  return largeFiles.sort((a, b) => b.size - a.size).slice(0, 20);
};
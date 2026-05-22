import { Filesystem, Directory } from '@capacitor/filesystem';

export interface StorageInfo {
  total: number;
  used: number;
  available: number;
}

export interface ScanFileInfo {
  name: string;
  path: string;
  size: number;
  type: 'file' | 'folder';
  modified: Date;
}

export const getStorageInfo = async (): Promise<StorageInfo> => {
  try {
    const result = await fetch('file:///android_asset/public/storage-info.json');
    if (result.ok) {
      const data = await result.json();
      return data;
    }
  } catch (e) {
    console.log('Using device storage API');
  }

  return {
    total: 0,
    used: 0,
    available: 0
  };
};

export const getRealFiles = async (basePath: string = ''): Promise<ScanFileInfo[]> => {
  try {
    const result = await Filesystem.readdir({
      path: basePath,
      directory: Directory.ExternalStorage,
    });

    const files: ScanFileInfo[] = await Promise.all(
      result.files.map(async (file) => {
        let size = 0;
        let modified = new Date();

        if (file.type === 'file') {
          try {
            const stat = await Filesystem.stat({
              path: `${basePath}/${file.name}`.replace(/^\/+/, ''),
              directory: Directory.ExternalStorage,
            });
            size = stat.size || 0;
            modified = stat.mtime ? new Date(stat.mtime) : new Date();
          } catch (e) {
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
  } catch (error) {
    console.error('Error reading files:', error);
    return [];
  }
};

export const deleteFilesInDirectory = async (path: string): Promise<number> => {
  let deletedSize = 0;
  try {
    const files = await getRealFiles(path);

    for (const file of files) {
      if (file.type === 'file') {
        try {
          const cleanPath = `${path}/${file.name}`.replace(/^\/+/, '');
          await Filesystem.deleteFile({
            path: cleanPath,
            directory: Directory.ExternalStorage,
          });
          deletedSize += file.size;
        } catch (e) {
          console.log('Cannot delete:', file.name);
        }
      } else if (file.type === 'folder') {
        deletedSize += await deleteFilesInDirectory(file.path);
        try {
          const cleanPath = file.path.replace(/^\/+/, '');
          await Filesystem.rmdir({
            path: cleanPath,
            directory: Directory.ExternalStorage,
          });
        } catch (e) {
          console.log('Cannot delete folder:', file.path);
        }
      }
    }
  } catch (e) {
    console.log('Cannot delete from:', path);
  }
  return deletedSize;
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
    } catch (e) {
      console.log('Cannot scan:', path);
    }
  };
  
  await scanDirectory('');
  return largeFiles.sort((a, b) => b.size - a.size).slice(0, 20);
};

export const getStorageBreakdown = async (): Promise<{ name: string; value: number; color: string }[]> => {
  try {
    const categories = {
      images: { name: '图片', value: 0, color: '#FF6B6B', extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'] },
      videos: { name: '视频', value: 0, color: '#4ECDC4', extensions: ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'] },
      audio: { name: '音乐', value: 0, color: '#45B7D1', extensions: ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'] },
      documents: { name: '文档', value: 0, color: '#96CEB4', extensions: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'] },
      apks: { name: '应用', value: 0, color: '#45B7D1', extensions: ['apk'] },
      archives: { name: '压缩', value: 0, color: '#FFEAA7', extensions: ['zip', 'rar', '7z', 'tar', 'gz'] },
      others: { name: '其他', value: 0, color: '#DFE6E9', extensions: [] },
    };
    
    const scanDirs = ['/Pictures', '/DCIM', '/Download', '/Documents', '/Music', '/Movies', '/WhatsApp/Media'];
    
    for (const dir of scanDirs) {
      try {
        const files = await getRealFiles(dir.replace(/^\/+/, ''));
        
        for (const file of files) {
          if (file.type === 'file') {
            const ext = file.name.split('.').pop()?.toLowerCase() || '';
            
            if (categories.images.extensions.includes(ext)) {
              categories.images.value += file.size;
            } else if (categories.videos.extensions.includes(ext)) {
              categories.videos.value += file.size;
            } else if (categories.audio.extensions.includes(ext)) {
              categories.audio.value += file.size;
            } else if (categories.documents.extensions.includes(ext)) {
              categories.documents.value += file.size;
            } else if (categories.apks.extensions.includes(ext)) {
              categories.apks.value += file.size;
            } else if (categories.archives.extensions.includes(ext)) {
              categories.archives.value += file.size;
            } else {
              categories.others.value += file.size;
            }
          }
        }
      } catch (e) {
        console.log('Cannot scan dir:', dir);
      }
    }
    
    return [
      { name: categories.images.name, value: categories.images.value, color: categories.images.color },
      { name: categories.videos.name, value: categories.videos.value, color: categories.videos.color },
      { name: categories.apks.name, value: categories.apks.value, color: categories.apks.color },
      { name: categories.documents.name, value: categories.documents.value, color: categories.documents.color },
      { name: categories.archives.name, value: categories.archives.value, color: categories.archives.color },
      { name: categories.others.name, value: categories.others.value, color: categories.others.color },
    ];
  } catch (error) {
    console.error('Error getting breakdown:', error);
    return [];
  }
};
import { Filesystem, Directory, FileInfo, ReaddirResult } from '@capacitor/filesystem';
import { FileItem, FileCategory } from '../types';
import { getFileCategory } from '../utils/fileUtils';

export const getFilesInDirectory = async (path: string): Promise<FileItem[]> => {
  try {
    let directory = Directory.Documents;
    let filePath = '';
    
    if (path === '/' || path === '') {
      directory = Directory.ExternalStorage;
      filePath = '';
    } else {
      directory = Directory.ExternalStorage;
      filePath = path;
    }

    const result: ReaddirResult = await Filesystem.readdir({
      path: filePath,
      directory: directory,
    });

    const files: FileItem[] = await Promise.all(
      result.files.map(async (fileInfo: FileInfo) => {
        let size = 0;
        let modified = new Date();

        if (fileInfo.type === 'file') {
          try {
            const fullFilePath = filePath ? `${filePath}/${fileInfo.name}` : fileInfo.name;
            const stat = await Filesystem.stat({
              path: fullFilePath,
              directory: directory,
            });
            size = stat.size || 0;
            modified = stat.ctime ? new Date(stat.ctime) : new Date();
          } catch {
            size = 0;
          }
        }

        const fullPath = path === '/' ? `/${fileInfo.name}` : `${path}/${fileInfo.name}`;
        const extension = fileInfo.name.split('.').pop()?.toLowerCase();
        
        return {
          id: `${path}-${fileInfo.name}`,
          name: fileInfo.name,
          type: fileInfo.type as 'file' | 'folder',
          size,
          modified,
          path: fullPath,
          extension,
          category: fileInfo.type === 'file' ? getFileCategory(fileInfo.name) : undefined,
        };
      })
    );

    return files;
  } catch (error) {
    console.error('Error reading directory:', error);
    return [];
  }
};

export const deleteFileOrFolder = async (path: string, name: string): Promise<boolean> => {
  try {
    const fullPath = path && path !== '/' ? `${path}/${name}` : name;
    await Filesystem.deleteFile({
      path: fullPath,
      directory: Directory.ExternalStorage,
    });
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
};

export const createFolder = async (path: string, name: string): Promise<boolean> => {
  try {
    const fullPath = path && path !== '/' ? `${path}/${name}` : name;
    await Filesystem.mkdir({
      path: fullPath,
      directory: Directory.ExternalStorage,
      recursive: false,
    });
    return true;
  } catch (error) {
    console.error('Error creating folder:', error);
    return false;
  }
};

export const copyFile = async (srcPath: string, destPath: string): Promise<boolean> => {
  try {
    const srcDir = Directory.ExternalStorage;
    const destDir = Directory.ExternalStorage;

    const srcFile = await Filesystem.readFile({
      path: srcPath,
      directory: srcDir,
    });

    await Filesystem.writeFile({
      path: destPath,
      data: srcFile.data,
      directory: destDir,
    });
    return true;
  } catch (error) {
    console.error('Error copying file:', error);
    return false;
  }
};

export const moveFile = async (srcPath: string, destPath: string): Promise<boolean> => {
  try {
    const success = await copyFile(srcPath, destPath);
    if (success) {
      const parts = srcPath.split('/');
      const fileName = parts[parts.length - 1];
      await deleteFileOrFolder(srcPath.replace(`/${fileName}`, ''), fileName);
    }
    return success;
  } catch (error) {
    console.error('Error moving file:', error);
    return false;
  }
};

export const getStorageStats = async (): Promise<{ total: number; used: number; available: number } | null> => {
  return null;
};

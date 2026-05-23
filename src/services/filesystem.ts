import { Filesystem, Directory, FileInfo, ReaddirResult } from '@capacitor/filesystem';
import { FileItem, FileCategory } from '../types';
import { getFileCategory } from '../utils/fileUtils';

export const getFilesInDirectory = async (path: string): Promise<FileItem[]> => {
  try {
    console.log('Reading directory:', path);

    let directory = Directory.Documents;
    let filePath = '';

    if (path === '/' || path === '') {
      directory = Directory.ExternalStorage;
      filePath = '';
    } else {
      directory = Directory.ExternalStorage;
      filePath = path.startsWith('/') ? path.substring(1) : path;
    }

    console.log('Using directory:', directory, 'path:', filePath);

    const result: ReaddirResult = await Filesystem.readdir({
      path: filePath,
      directory: directory,
    });

    console.log('Directory read successful, files:', result.files.length);

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
          } catch (e) {
            console.log('Error getting file stats:', fileInfo.name, e);
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
    throw error;
  }
};

export const deleteFileOrFolder = async (path: string, name: string, fileType: 'file' | 'folder'): Promise<boolean> => {
  try {
    const cleanPath = path && path !== '/' ? (path.startsWith('/') ? path.substring(1) : path) : '';
    const fullPath = cleanPath ? `${cleanPath}/${name}` : name;

    if (fileType === 'folder') {
      await deleteDirectoryRecursive(fullPath);
    } else {
      await Filesystem.deleteFile({
        path: fullPath,
        directory: Directory.ExternalStorage,
      });
    }
    return true;
  } catch (error) {
    console.error('Error deleting:', error);
    return false;
  }
};

const deleteDirectoryRecursive = async (path: string): Promise<void> => {
  try {
    const result = await Filesystem.readdir({
      path: path,
      directory: Directory.ExternalStorage,
    });

    for (const file of result.files) {
      const childPath = path ? `${path}/${file.name}` : file.name;

      if (file.type === 'directory') {
        await deleteDirectoryRecursive(childPath);
      } else {
        await Filesystem.deleteFile({
          path: childPath,
          directory: Directory.ExternalStorage,
        });
      }
    }

    await Filesystem.rmdir({
      path: path,
      directory: Directory.ExternalStorage,
      recursive: true,
    });
  } catch (e) {
    console.log('Cannot delete directory:', path, e);
    throw e;
  }
};

export const createFolder = async (path: string, name: string): Promise<boolean> => {
  try {
    const cleanPath = path && path !== '/' ? (path.startsWith('/') ? path.substring(1) : path) : '';
    const fullPath = cleanPath ? `${cleanPath}/${name}` : name;
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

export const copyFileOrFolder = async (srcPath: string, destPath: string, fileType: 'file' | 'folder'): Promise<boolean> => {
  try {
    if (fileType === 'folder') {
      await copyDirectoryRecursive(srcPath, destPath);
    } else {
      const srcDir = Directory.ExternalStorage;
      const destDir = Directory.ExternalStorage;

      const srcFile = await Filesystem.readFile({
        path: srcPath.startsWith('/') ? srcPath.substring(1) : srcPath,
        directory: srcDir,
      });

      await Filesystem.writeFile({
        path: destPath.startsWith('/') ? destPath.substring(1) : destPath,
        data: srcFile.data,
        directory: destDir,
      });
    }
    return true;
  } catch (error) {
    console.error('Error copying:', error);
    return false;
  }
};

const copyDirectoryRecursive = async (srcPath: string, destPath: string): Promise<void> => {
  try {
    await Filesystem.mkdir({
      path: destPath.startsWith('/') ? destPath.substring(1) : destPath,
      directory: Directory.ExternalStorage,
      recursive: false,
    });

    const result = await Filesystem.readdir({
      path: srcPath.startsWith('/') ? srcPath.substring(1) : srcPath,
      directory: Directory.ExternalStorage,
    });

    for (const file of result.files) {
      const srcChildPath = srcPath.endsWith('/') ? `${srcPath}${file.name}` : `${srcPath}/${file.name}`;
      const destChildPath = destPath.endsWith('/') ? `${destPath}${file.name}` : `${destPath}/${file.name}`;

      if (file.type === 'directory') {
        await copyDirectoryRecursive(srcChildPath, destChildPath);
      } else {
        await copyFileOrFolder(srcChildPath, destChildPath, 'file');
      }
    }
  } catch (e) {
    console.log('Cannot copy directory:', srcPath, e);
    throw e;
  }
};

export const moveFileOrFolder = async (srcPath: string, destPath: string, fileType: 'file' | 'folder'): Promise<boolean> => {
  try {
    const success = await copyFileOrFolder(srcPath, destPath, fileType);
    if (success) {
      const parts = srcPath.split('/');
      const fileName = parts[parts.length - 1];
      const parentPath = parts.slice(0, -1).join('/');
      await deleteFileOrFolder(parentPath, fileName, fileType);
    }
    return success;
  } catch (error) {
    console.error('Error moving:', error);
    return false;
  }
};

export const renameFileOrFolder = async (parentPath: string, oldName: string, newName: string, fileType: 'file' | 'folder'): Promise<boolean> => {
  try {
    const cleanParent = parentPath && parentPath !== '/' ? (parentPath.startsWith('/') ? parentPath.substring(1) : parentPath) : '';
    const oldFull = cleanParent ? `${cleanParent}/${oldName}` : oldName;
    const newFull = cleanParent ? `${cleanParent}/${newName}` : newName;

    await Filesystem.rename({
      from: oldFull,
      to: newFull,
      directory: Directory.ExternalStorage,
    });
    return true;
  } catch (e) {
    console.error('Error renaming:', e);
    return false;
  }
};

export const searchFiles = async (
  basePath: string,
  query: string,
  maxResults: number = 50
): Promise<FileItem[]> => {
  const results: FileItem[] = [];
  const searchLower = query.toLowerCase();

  const scanDir = async (dirPath: string) => {
    if (results.length >= maxResults) return;
    try {
      const cleanPath = dirPath && dirPath !== '/' ? (dirPath.startsWith('/') ? dirPath.substring(1) : dirPath) : '';
      const items = await Filesystem.readdir({
        path: cleanPath,
        directory: Directory.ExternalStorage,
      });

      for (const item of items.files) {
        if (results.length >= maxResults) return;
        if (item.name.toLowerCase().includes(searchLower)) {
          const fullPath = dirPath === '/' ? `/${item.name}` : `${dirPath}/${item.name}`;
          results.push({
            id: `${dirPath}-${item.name}`,
            name: item.name,
            type: item.type as 'file' | 'folder',
            size: 0,
            modified: new Date(),
            path: fullPath,
            extension: item.type === 'file' ? item.name.split('.').pop()?.toLowerCase() : undefined,
            category: item.type === 'file' ? getFileCategory(item.name) : undefined,
          });
        }
        if (item.type === 'directory' && !item.name.startsWith('.') && item.name !== 'Android') {
          const childPath = dirPath === '/' ? `/${item.name}` : `${dirPath}/${item.name}`;
          await scanDir(childPath);
        }
      }
    } catch (e) {
      // Skip inaccessible directories
    }
  };

  await scanDir(basePath);
  return results;
};

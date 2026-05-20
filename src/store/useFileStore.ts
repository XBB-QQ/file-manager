import { create } from 'zustand';
import { FileItem, CacheItem, StorageStats, LargeFile } from '../types';
import { getFilesInDirectory, deleteFileOrFolder } from '../services/filesystem';
import { requestStoragePermissions, checkStoragePermissions } from '../services/permissions';

interface FileStore {
  currentPath: string;
  files: FileItem[];
  cacheItems: CacheItem[];
  storageStats: StorageStats;
  largeFiles: LargeFile[];
  selectedFiles: Set<string>;
  viewMode: 'grid' | 'list';
  isMultiSelect: boolean;
  isScanning: boolean;
  isLoading: boolean;
  sortBy: 'name' | 'size' | 'date';
  sortOrder: 'asc' | 'desc';
  clipboard: {
    type: 'copy' | 'cut' | null;
    files: FileItem[];
  };
  hasPermission: boolean;
  permissionError: string | null;

  setCurrentPath: (path: string) => void;
  navigateToFolder: (folder: FileItem) => void;
  goBack: () => void;
  setViewMode: (mode: 'grid' | 'list') => void;
  toggleFileSelection: (fileId: string) => void;
  selectAll: () => void;
  clearSelection: () => void;
  toggleMultiSelect: () => void;
  deleteSelected: () => void;
  copyFiles: () => void;
  cutFiles: () => void;
  pasteFiles: () => void;
  setSortBy: (by: 'name' | 'size' | 'date') => void;
  setSortOrder: (order: 'asc' | 'desc') => void;
  getSortedFiles: () => FileItem[];
  toggleCacheSelection: (id: string) => void;
  selectAllCache: () => void;
  clearAllCache: () => void;
  scanCache: () => void;
  cleanCache: () => void;
  deleteFile: (id: string) => void;
  loadFiles: (path: string) => void;
  refreshFiles: () => void;
  requestPermissions: () => Promise<boolean>;
}

export const useFileStore = create<FileStore>((set, get) => ({
  currentPath: '/',
  files: [],
  cacheItems: [],
  storageStats: {
    total: 0,
    used: 0,
    available: 0,
    breakdown: [],
  },
  largeFiles: [],
  selectedFiles: new Set(),
  viewMode: 'grid',
  isMultiSelect: false,
  isScanning: false,
  isLoading: false,
  sortBy: 'name',
  sortOrder: 'asc',
  clipboard: { type: null, files: [] },
  hasPermission: false,
  permissionError: null,

  setCurrentPath: (path) => {
    set({ currentPath: path, selectedFiles: new Set(), isMultiSelect: false });
    get().loadFiles(path);
  },

  navigateToFolder: (folder) => {
    const newPath = folder.path;
    set({ 
      currentPath: newPath, 
      selectedFiles: new Set(), 
      isMultiSelect: false 
    });
    get().loadFiles(newPath);
  },

  goBack: () => {
    const { currentPath } = get();
    if (currentPath !== '/') {
      const parts = currentPath.split('/');
      parts.pop();
      const newPath = parts.length === 1 ? '/' : parts.join('/');
      set({ currentPath: newPath, selectedFiles: new Set(), isMultiSelect: false });
      get().loadFiles(newPath);
    }
  },

  setViewMode: (mode) => set({ viewMode: mode }),

  toggleFileSelection: (fileId) => {
    set((state) => {
      const newSelected = new Set(state.selectedFiles);
      if (newSelected.has(fileId)) {
        newSelected.delete(fileId);
      } else {
        newSelected.add(fileId);
      }
      return { selectedFiles: newSelected, isMultiSelect: newSelected.size > 0 };
    });
  },

  selectAll: () => {
    set((state) => {
      const allIds = state.files.map(f => f.id);
      return { selectedFiles: new Set(allIds), isMultiSelect: true };
    });
  },

  clearSelection: () => set({ selectedFiles: new Set(), isMultiSelect: false }),

  toggleMultiSelect: () => set((state) => ({ 
    isMultiSelect: !state.isMultiSelect, 
    selectedFiles: !state.isMultiSelect ? new Set() : state.selectedFiles 
  })),

  deleteSelected: async () => {
    const { selectedFiles, files, currentPath } = get();
    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));
    
    for (const file of selectedFileItems) {
      await deleteFileOrFolder(currentPath, file.name);
    }

    await get().loadFiles(currentPath);
    set({ selectedFiles: new Set(), isMultiSelect: false });
  },

  copyFiles: async () => {
    const { selectedFiles, files } = get();
    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));
    set({ 
      clipboard: { type: 'copy', files: selectedFileItems }, 
      selectedFiles: new Set(), 
      isMultiSelect: false 
    });
  },

  cutFiles: async () => {
    const { selectedFiles, files } = get();
    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));
    set({ 
      clipboard: { type: 'cut', files: selectedFileItems }, 
      selectedFiles: new Set(), 
      isMultiSelect: false 
    });
  },

  pasteFiles: async () => {
    const { clipboard, currentPath } = get();
    if (clipboard.files.length === 0) return;

    set({ isLoading: true });
    
    try {
      for (const file of clipboard.files) {
        const destPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
        
        if (clipboard.type === 'copy') {
          await copyFile(file.path, destPath);
        } else if (clipboard.type === 'cut') {
          await moveFile(file.path, destPath);
        }
      }
      
      set({ clipboard: { type: null, files: [] } });
      await get().loadFiles(currentPath);
    } catch (error) {
      console.error('Error pasting files:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  setSortBy: (by) => set({ sortBy: by }),

  setSortOrder: (order) => set({ sortOrder: order }),

  getSortedFiles: () => {
    const { files, sortBy, sortOrder } = get();
    return [...files].sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'size') {
        comparison = a.size - b.size;
      } else if (sortBy === 'date') {
        comparison = a.modified.getTime() - b.modified.getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  },

  toggleCacheSelection: (id) => {
    set((state) => ({
      cacheItems: state.cacheItems.map(item =>
        item.id === id ? { ...item, isSelected: !item.isSelected } : item
      )
    }));
  },

  selectAllCache: () => {
    set((state) => ({
      cacheItems: state.cacheItems.map(item => ({ ...item, isSelected: true }))
    }));
  },

  clearAllCache: () => {
    set((state) => ({
      cacheItems: state.cacheItems.map(item => ({ ...item, isSelected: false }))
    }));
  },

  scanCache: () => {
    set({ isScanning: true });
    setTimeout(() => set({ isScanning: false }), 2000);
  },

  cleanCache: () => {
    set((state) => ({
      cacheItems: state.cacheItems.filter(item => !item.isSelected)
    }));
  },

  deleteFile: (id) => {
    set((state) => ({
      files: state.files.filter(f => f.id !== id)
    }));
  },

  loadFiles: async (path: string) => {
    set({ isLoading: true, permissionError: null });
    try {
      const realFiles = await getFilesInDirectory(path);
      set({ 
        files: realFiles, 
        hasPermission: true,
        permissionError: null,
        isLoading: false 
      });
    } catch (error: any) {
      console.error('Failed to load files:', error);
      const errorMessage = error?.message || String(error) || '无法访问存储';
      
      const isPermissionError = 
        errorMessage.toLowerCase().includes('permission') || 
        errorMessage.toLowerCase().includes('denied') ||
        errorMessage.toLowerCase().includes('access') ||
        errorMessage.toLowerCase().includes('security');
      
      set({ 
        files: [],
        hasPermission: !isPermissionError,
        permissionError: isPermissionError ? '需要存储权限才能访问文件，请点击下方按钮申请权限' : errorMessage,
        isLoading: false 
      });
    }
  },

  refreshFiles: () => {
    const { currentPath } = get();
    get().loadFiles(currentPath);
  },

  requestPermissions: async (): Promise<boolean> => {
    try {
      const granted = await requestStoragePermissions();
      
      if (granted) {
        set({ hasPermission: true, permissionError: null });
        get().loadFiles('/');
        return true;
      } else {
        set({ 
          hasPermission: false, 
          permissionError: '需要存储权限才能访问文件，请在设置中授予' 
        });
        return false;
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
      set({ 
        hasPermission: false, 
        permissionError: '权限请求失败，请在设置中手动授予' 
      });
      return false;
    }
  },
}));
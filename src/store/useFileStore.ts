import { create } from 'zustand';
import { FileItem, CacheItem, StorageStats, LargeFile } from '../types';
import { generateMockFiles } from '../utils/fileUtils';
import { getFilesInDirectory, deleteFileOrFolder } from '../services/filesystem';

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
}

export const useFileStore = create<FileStore>((set, get) => ({
  currentPath: '/',
  files: generateMockFiles(),
  cacheItems: [
    { id: 'c1', appName: '微信', cacheSize: 500000000, cacheType: '聊天缓存、图片、视频', cachePath: '/Android/data/com.tencent.mm/', isSelected: true },
    { id: 'c2', appName: '抖音', cacheSize: 300000000, cacheType: '视频缓存、缩略图', cachePath: '/Android/data/com.ss.android.ugc.aweme/', isSelected: true },
    { id: 'c3', appName: '淘宝', cacheSize: 200000000, cacheType: '图片缓存、商品数据', cachePath: '/Android/data/com.taobao.taobao/', isSelected: false },
    { id: 'c4', appName: '系统缓存', cacheSize: 150000000, cacheType: '系统临时文件、日志', cachePath: '/data/local/tmp/', isSelected: true },
  ],
  storageStats: {
    total: 128000000000,
    used: 85000000000,
    available: 43000000000,
    breakdown: [
      { name: '图片', value: 25000000000, color: '#FF6B6B' },
      { name: '视频', value: 35000000000, color: '#4ECDC4' },
      { name: '应用', value: 15000000000, color: '#45B7D1' },
      { name: '文档', value: 5000000000, color: '#96CEB4' },
      { name: '其他', value: 5000000000, color: '#FFEAA7' },
    ],
  },
  largeFiles: [
    { id: 'lf1', name: 'backup_2024.zip', size: 2500000000, path: '/Download/' },
    { id: 'lf2', name: 'movie.mp4', size: 1800000000, path: '/Movies/' },
    { id: 'lf3', name: 'photos.tar.gz', size: 1200000000, path: '/DCIM/' },
  ],
  selectedFiles: new Set(),
  viewMode: 'grid',
  isMultiSelect: false,
  isScanning: false,
  isLoading: false,
  sortBy: 'name',
  sortOrder: 'asc',
  clipboard: { type: null, files: [] },

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

    set((state) => ({
      files: state.files.filter(f => !state.selectedFiles.has(f.id)),
      selectedFiles: new Set(),
      isMultiSelect: false
    }));
  },

  copyFiles: () => {
    const { selectedFiles, files } = get();
    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));
    set({ 
      clipboard: { type: 'copy', files: selectedFileItems }, 
      selectedFiles: new Set(), 
      isMultiSelect: false 
    });
  },

  cutFiles: () => {
    const { selectedFiles, files } = get();
    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));
    set({ 
      clipboard: { type: 'cut', files: selectedFileItems }, 
      selectedFiles: new Set(), 
      isMultiSelect: false 
    });
  },

  pasteFiles: () => {
    const { clipboard, files } = get();
    if (clipboard.files.length === 0) return;

    const newFiles = [...files];
    
    if (clipboard.type === 'copy') {
      clipboard.files.forEach(file => {
        const newFile = { ...file, id: `${file.id}-copy-${Date.now()}` };
        newFiles.push(newFile);
      });
    } else if (clipboard.type === 'cut') {
      const existingIds = new Set(files.map(f => f.id));
      clipboard.files.forEach(file => {
        if (!existingIds.has(file.id)) {
          newFiles.push(file);
        }
      });
    }

    set({ files: newFiles, clipboard: { type: null, files: [] } });
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
    set({ isLoading: true });
    try {
      const realFiles = await getFilesInDirectory(path);
      set({ files: realFiles.length > 0 ? realFiles : generateMockFiles() });
    } catch (error) {
      console.error('Failed to load files:', error);
      set({ files: generateMockFiles() });
    } finally {
      set({ isLoading: false });
    }
  },

  refreshFiles: () => {
    const { currentPath } = get();
    get().loadFiles(currentPath);
  },
}));
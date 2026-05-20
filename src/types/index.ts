export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size: number;
  modified: Date;
  path: string;
  extension?: string;
  category?: FileCategory;
}

export type FileCategory =
  | 'image'
  | 'video'
  | 'document'
  | 'audio'
  | 'apk'
  | 'archive'
  | 'other';

export interface CacheItem {
  id: string;
  appName: string;
  appIcon?: string;
  cacheSize: number;
  cacheType: string;
  cachePath: string;
  isSelected: boolean;
}

export interface StorageStats {
  total: number;
  used: number;
  available: number;
  breakdown: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export interface LargeFile {
  id: string;
  name: string;
  size: number;
  path: string;
}

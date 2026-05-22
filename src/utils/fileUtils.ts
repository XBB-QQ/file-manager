import { FileCategory, FileItem } from '../types';

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileCategory = (fileName: string): FileCategory => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  
  const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg', 'ico'];
  const videoExts = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'];
  const docExts = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'rtf'];
  const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'];
  const archiveExts = ['zip', 'rar', '7z', 'tar', 'gz'];
  
  if (ext === 'apk') return 'apk';
  if (imageExts.includes(ext)) return 'image';
  if (videoExts.includes(ext)) return 'video';
  if (docExts.includes(ext)) return 'document';
  if (audioExts.includes(ext)) return 'audio';
  if (archiveExts.includes(ext)) return 'archive';
  
  return 'other';
};

export const generateMockFiles = (): FileItem[] => {
  const folders: FileItem[] = [
    { id: '1', name: 'DCIM', type: 'folder', size: 0, modified: new Date(), path: '/DCIM' },
    { id: '2', name: 'Download', type: 'folder', size: 0, modified: new Date(), path: '/Download' },
    { id: '3', name: 'Pictures', type: 'folder', size: 0, modified: new Date(), path: '/Pictures' },
    { id: '4', name: 'Music', type: 'folder', size: 0, modified: new Date(), path: '/Music' },
    { id: '5', name: 'Documents', type: 'folder', size: 0, modified: new Date(), path: '/Documents' },
  ];

  const files: FileItem[] = [
    { id: '101', name: 'photo1.jpg', type: 'file', size: 3500000, modified: new Date(Date.now() - 86400000), path: '/photo1.jpg', extension: 'jpg', category: 'image' },
    { id: '102', name: 'video.mp4', type: 'file', size: 150000000, modified: new Date(Date.now() - 172800000), path: '/video.mp4', extension: 'mp4', category: 'video' },
    { id: '103', name: 'report.pdf', type: 'file', size: 2500000, modified: new Date(Date.now() - 259200000), path: '/report.pdf', extension: 'pdf', category: 'document' },
    { id: '104', name: 'song.mp3', type: 'file', size: 8000000, modified: new Date(Date.now() - 345600000), path: '/song.mp3', extension: 'mp3', category: 'audio' },
    { id: '105', name: 'app.apk', type: 'file', size: 50000000, modified: new Date(Date.now() - 432000000), path: '/app.apk', extension: 'apk', category: 'apk' },
    { id: '106', name: 'archive.zip', type: 'file', size: 10000000, modified: new Date(Date.now() - 518400000), path: '/archive.zip', extension: 'zip', category: 'archive' },
  ];

  return [...folders, ...files];
};

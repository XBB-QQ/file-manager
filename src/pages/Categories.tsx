import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '../store/useFileStore';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Smartphone,
  Archive,
  Folder,
  Star,
  Download,
  HardDrive,
  Clock,
  Shield,
  RefreshCw,
  Trash2,
  Search,
  ChevronLeft,
  Loader2,
  X,
  Info,
} from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';
import { scanFilesByCategory, CategoryFiles, ScanFileInfo } from '../services/systemInfo';
import { deleteFileOrFolder } from '../services/filesystem';
import { Capacitor } from '@capacitor/core';

const Categories = () => {
  const navigate = useNavigate();
  const { requestPermissions, hasPermission } = useFileStore();
  const [categories, setCategories] = useState<Record<string, CategoryFiles>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<{ name: string; path: string; size: number } | null>(null);
  const [previewData, setPreviewData] = useState('');
  const [previewType, setPreviewType] = useState<'image' | 'video' | 'text' | 'info' | 'loading'>('loading');

  const getMimeFromExt = (name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const m: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
      webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml',
      mp4: 'video/mp4', webm: 'video/webm', '3gp': 'video/3gpp', mkv: 'video/x-matroska',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac',
      txt: 'text/plain', md: 'text/plain', json: 'application/json', xml: 'text/xml',
      html: 'text/html', css: 'text/css', js: 'text/javascript', log: 'text/plain', csv: 'text/csv',
    };
    return m[ext] || '';
  };

  const isTextFile = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'log', 'csv', 'yml', 'yaml', 'ini', 'cfg'].includes(ext);
  };

  const handlePreview = async (file: { name: string; path: string; size: number }) => {
    if (file.size > 100 * 1024 * 1024) {
      setPreviewFile(file);
      setPreviewType('info');
      return;
    }
    setPreviewFile(file);
    setPreviewType('loading');
    setPreviewData('');

    try {
      const relativePath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
      const absolutePath = `/storage/emulated/0/${relativePath}`;
      const webUrl = Capacitor.convertFileSrc(absolutePath);
      const mime = getMimeFromExt(file.name);

      if (mime.startsWith('image/')) {
        setPreviewData(webUrl);
        setPreviewType('image');
      } else if (mime.startsWith('video/') || mime.startsWith('audio/')) {
        setPreviewData(webUrl);
        setPreviewType('video');
      } else if (isTextFile(file.name)) {
        try {
          const result = await Filesystem.readFile({
            path: relativePath,
            directory: Directory.ExternalStorage,
          });
          const data = (result.data as string) || '';
          const binary = atob(data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          setPreviewData(new TextDecoder('utf-8').decode(bytes).substring(0, 50000));
          setPreviewType('text');
        } catch {
          setPreviewData('无法读取文件内容');
          setPreviewType('text');
        }
      } else {
        setPreviewType('info');
      }
    } catch {
      setPreviewType('info');
    }
  };

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const cats = await scanFilesByCategory();
      setCategories(cats);
      setPermissionError(false);
    } catch {
      setPermissionError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestPermissions().then(granted => {
      if (granted) {
        loadCategories();
      } else {
        setPermissionError(true);
        setIsLoading(false);
      }
    });
  }, []);

  const handleDeleteFile = async (file: ScanFileInfo) => {
    if (!window.confirm(`确定删除 "${file.name}"？`)) return;
    const parts = file.path.split('/');
    const name = parts.pop() || '';
    const parentPath = parts.join('/') || '/';
    const ok = await deleteFileOrFolder(parentPath, name, 'file');
    if (ok) {
      setCategories(prev => {
        const updated = { ...prev };
        for (const key of Object.keys(updated)) {
          updated[key] = {
            ...updated[key],
            files: updated[key].files.filter(f => f.path !== file.path),
            totalSize: updated[key].totalSize - (key === selectedCategory ? file.size : 0),
          };
        }
        return updated;
      });
    }
  };

  const handleSelectCategory = (catId: string) => {
    setSelectedCategory(catId);
  };

  const handleBack = () => {
    setSelectedCategory(null);
  };

  const categoryCards = [
    { id: 'image', label: '图片', icon: ImageIcon, color: 'text-green-500', bgColor: 'bg-green-50', borderColor: 'border-green-200' },
    { id: 'video', label: '视频', icon: Video, color: 'text-purple-500', bgColor: 'bg-purple-50', borderColor: 'border-purple-200' },
    { id: 'document', label: '文档', icon: FileText, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' },
    { id: 'audio', label: '音乐', icon: Music, color: 'text-pink-500', bgColor: 'bg-pink-50', borderColor: 'border-pink-200' },
    { id: 'apk', label: '应用', icon: Smartphone, color: 'text-blue-500', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' },
    { id: 'archive', label: '压缩包', icon: Archive, color: 'text-orange-500', bgColor: 'bg-orange-50', borderColor: 'border-orange-200' },
  ];

  const quickAccess = [
    { icon: Star, label: '收藏夹', color: 'text-yellow-500' },
    { icon: Download, label: '下载', color: 'text-blue-500' },
    { icon: HardDrive, label: '内部存储', color: 'text-green-500' },
    { icon: Clock, label: '最近文件', color: 'text-purple-500' },
  ];

  const totalCount = Object.values(categories).reduce((sum, cat) => sum + cat.files.length, 0);
  const totalSize = Object.values(categories).reduce((sum, cat) => sum + cat.totalSize, 0);

  const selectedCategoryData = selectedCategory ? categories[selectedCategory] : null;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {selectedCategory && selectedCategoryData ? (
        <>
          <div className="bg-white border-b border-gray-200 px-4">
            <div className="flex items-center h-14 gap-2">
              <button onClick={handleBack} className="p-1 hover:bg-gray-100 rounded">
                <ChevronLeft size={24} />
              </button>
              <h1 className="text-lg font-semibold">{selectedCategoryData.name}</h1>
              <span className="text-sm text-gray-400 ml-1">
                {selectedCategoryData.files.length} 个文件 · {formatFileSize(selectedCategoryData.totalSize)}
              </span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {selectedCategoryData.files.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <Folder size={48} className="mb-2 opacity-50" />
                <p>此分类下没有文件</p>
              </div>
            ) : (
              <div className="space-y-1">
                {selectedCategoryData.files
                  .sort((a, b) => b.size - a.size)
                  .map((file, idx) => (
                    <div
                      key={idx}
                      onClick={() => handlePreview(file)}
                      className="flex items-center gap-3 px-3 py-2 bg-white rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50"
                    >
                      <Folder size={18} className="text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400 truncate">{file.path}</p>
                      </div>
                      <span className="text-xs text-gray-500 flex-shrink-0">{formatFileSize(file.size)}</span>
                      <button
                        onClick={e => { e.stopPropagation(); handleDeleteFile(file); }}
                        className="p-1 hover:bg-red-50 rounded flex-shrink-0"
                      >
                        <Trash2 size={14} className="text-red-400 hover:text-red-500" />
                      </button>
                    </div>
                  ))}
              </div>
            )}

            {previewFile && (
              <div className="fixed inset-0 bg-black/80 z-50 flex flex-col" onClick={() => { setPreviewFile(null); setPreviewData(''); }}>
                <div className="flex items-center justify-between px-4 py-3 text-white">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{previewFile.name}</p>
                    <p className="text-xs text-gray-400">{formatFileSize(previewFile.size)}</p>
                  </div>
                  <button onClick={() => { setPreviewFile(null); setPreviewData(''); }} className="p-2 hover:bg-white/10 rounded-full">
                    <X size={24} />
                  </button>
                </div>
                <div className="flex-1 flex items-center justify-center overflow-auto" onClick={e => e.stopPropagation()}>
                  {previewType === 'loading' && <Loader2 size={40} className="animate-spin text-white" />}
                  {previewType === 'image' && previewData && <img src={previewData} alt={previewFile.name} className="max-w-full max-h-full object-contain" />}
                  {previewType === 'video' && previewData && <video src={previewData} controls autoPlay className="max-w-full max-h-full rounded-lg" />}
                  {previewType === 'text' && (
                    <div className="w-full max-w-2xl max-h-full overflow-auto bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm">
                      <pre className="whitespace-pre-wrap break-all">{previewData || '(空文件)'}</pre>
                    </div>
                  )}
                  {previewType === 'info' && (
                    <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4">
                      <div className="flex flex-col items-center text-center">
                        <FileText size={48} className="text-gray-400 mb-4" />
                        <h3 className="font-semibold text-gray-800 mb-2">{previewFile.name}</h3>
                        <div className="w-full space-y-2 mt-4 text-left text-sm">
                          <div className="flex justify-between"><span className="text-gray-500">大小</span><span className="font-medium">{formatFileSize(previewFile.size)}</span></div>
                          <div className="flex justify-between"><span className="text-gray-500">路径</span><span className="font-medium truncate ml-2">{previewFile.path}</span></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-4">不支持预览此格式</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="bg-white border-b border-gray-200 px-4">
            <div className="flex items-center h-14">
              <h1 className="text-lg font-semibold">文件分类</h1>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {permissionError ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Shield size={48} className="text-amber-500 mb-4" />
                <p className="text-gray-600 font-medium mb-2">需要存储权限</p>
                <p className="text-gray-400 text-sm text-center mb-4">无法扫描文件分类，请先授予存储权限</p>
                <button
                  onClick={() => {
                    setPermissionError(false);
                    setIsLoading(true);
                    requestPermissions().then(granted => {
                      if (granted) loadCategories();
                      else { setPermissionError(true); setIsLoading(false); }
                    });
                  }}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  请求权限
                </button>
              </div>
            ) : isLoading ? (
              <div className="flex flex-col items-center justify-center h-64">
                <Loader2 size={32} className="animate-spin text-blue-500 mb-3" />
                <p className="text-gray-400 text-sm">正在扫描文件...</p>
              </div>
            ) : (
              <>
                <div className="bg-blue-500 rounded-xl p-4 text-white mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">已扫描文件</p>
                      <p className="text-2xl font-bold mt-1">{totalCount} 个文件</p>
                      <p className="text-blue-100 text-sm mt-1">共占用 {formatFileSize(totalSize)}</p>
                    </div>
                    <button onClick={loadCategories} className="p-2 bg-white/20 rounded-full hover:bg-white/30">
                      <RefreshCw size={20} />
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">快捷访问</h2>
                  <div className="grid grid-cols-4 gap-2">
                    {quickAccess.map((item, idx) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={idx}
                          onClick={() => navigate('/')}
                          className="flex flex-col items-center p-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                        >
                          <div className={`p-3 rounded-full ${item.color.replace('text-', 'bg-').replace('500', '100')}`}>
                            <Icon size={28} className={item.color} />
                          </div>
                          <span className="text-xs font-medium text-gray-700 mt-2">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">文件类型</h2>
                  <div className="grid grid-cols-3 gap-3">
                    {categoryCards.map(card => {
                      const Icon = card.icon;
                      const data = categories[card.id];
                      const count = data?.files.length || 0;
                      const size = data?.totalSize || 0;

                      return (
                        <div
                          key={card.id}
                          onClick={() => { if (data?.files.length) handleSelectCategory(card.id); }}
                          className={`flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border ${card.borderColor} ${data?.files.length ? 'hover:shadow-md cursor-pointer' : 'opacity-60'} transition-all`}
                        >
                          <div className={`p-4 rounded-2xl ${card.bgColor}`}>
                            <Icon size={36} className={card.color} />
                          </div>
                          <p className="font-semibold text-gray-700 mt-3">{card.label}</p>
                          <p className="text-xs text-gray-400 mt-1">{isLoading ? '...' : `${count} 个`}</p>
                          <p className="text-sm font-medium text-gray-600 mt-1">
                            {isLoading ? '...' : formatFileSize(size)}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Categories;
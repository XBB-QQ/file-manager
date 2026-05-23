import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '../store/useFileStore';
import { createFolder, renameFileOrFolder, searchFiles } from '../services/filesystem';
import { Filesystem, Directory } from '@capacitor/filesystem';
import {
  Menu,
  ChevronLeft,
  Search,
  MoreVertical,
  Grid,
  List,
  CheckCircle2,
  Copy,
  Scissors,
  Trash2,
  Image,
  Video,
  FileText,
  Music,
  Smartphone,
  Archive,
  Folder,
  FolderPlus,
  PenLine,
  Star,
  Clock,
  Download,
  HardDrive,
  CheckSquare,
  RefreshCw,
  Loader2,
  Shield,
  X,
  Play,
  Info,
} from 'lucide-react';
import { FileItem } from '../types';
import { formatFileSize } from '../utils/fileUtils';

const FileExplorer = () => {
  const navigate = useNavigate();
  const {
    currentPath,
    selectedFiles,
    viewMode,
    isMultiSelect,
    isLoading,
    clipboard,
    setCurrentPath,
    navigateToFolder,
    goBack,
    setViewMode,
    toggleFileSelection,
    selectAll,
    clearSelection,
    toggleMultiSelect,
    deleteSelected,
    copyFiles,
    cutFiles,
    pasteFiles,
    getSortedFiles,
    loadFiles,
    refreshFiles,
    permissionError,
    hasPermission,
    requestPermissions,
  } = useFileStore();

  const [showSidebar, setShowSidebar] = useState(false);
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [renameFile, setRenameFile] = useState<FileItem | null>(null);
  const [renameName, setRenameName] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FileItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [previewData, setPreviewData] = useState<string>('');
  const [previewType, setPreviewType] = useState<'image' | 'video' | 'text' | 'info' | 'loading'>('loading');
  const sortedFiles = getSortedFiles();

  useEffect(() => {
    requestPermissions().then(granted => {
      if (granted) loadFiles('/');
    });
  }, []);

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="text-blue-500" size={viewMode === 'grid' ? 40 : 32} />;
    }

    switch (file.category) {
      case 'image':
        return <Image className="text-green-500" size={viewMode === 'grid' ? 40 : 32} />;
      case 'video':
        return <Video className="text-purple-500" size={viewMode === 'grid' ? 40 : 32} />;
      case 'audio':
        return <Music className="text-pink-500" size={viewMode === 'grid' ? 40 : 32} />;
      case 'document':
        return <FileText className="text-yellow-600" size={viewMode === 'grid' ? 40 : 32} />;
      case 'apk':
        return <Smartphone className="text-green-600" size={viewMode === 'grid' ? 40 : 32} />;
      case 'archive':
        return <Archive className="text-orange-500" size={viewMode === 'grid' ? 40 : 32} />;
      default:
        return <FileText className="text-gray-500" size={viewMode === 'grid' ? 40 : 32} />;
    }
  };

  const handleFileClick = (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isMultiSelect) {
      toggleFileSelection(file.id);
    } else if (file.type === 'folder') {
      navigateToFolder(file);
    } else {
      handlePreviewFile(file);
    }
  };

  const handleLongPress = (file: FileItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isMultiSelect) {
      toggleMultiSelect();
    }
    toggleFileSelection(file.id);
  };

  const handleQuickAccess = (label: string) => {
    setShowSidebar(false);
    switch (label) {
      case '内部存储': setCurrentPath('/'); break;
      case '下载': setCurrentPath('/Download'); break;
      case '收藏夹':
      case '最近': setCurrentPath('/'); break;
    }
  };

  const handleCategoryNav = () => {
    setShowSidebar(false);
    navigate('/categories');
  };

  const handlePermissionRetry = () => {
    useFileStore.setState({ hasPermission: false });
    requestPermissions().then(granted => {
      if (granted) loadFiles('/');
    });
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    const ok = await createFolder(currentPath, newFolderName.trim());
    if (ok) {
      setNewFolderName('');
      setShowNewFolder(false);
      refreshFiles();
    } else {
      alert('创建文件夹失败');
    }
  };

  const handleStartRename = (file: FileItem) => {
    setRenameFile(file);
    setRenameName(file.name);
  };

  const handleConfirmRename = async () => {
    if (!renameFile || !renameName.trim() || renameName.trim() === renameFile.name) {
      setRenameFile(null);
      return;
    }
    const ok = await renameFileOrFolder(currentPath, renameFile.name, renameName.trim(), renameFile.type);
    if (ok) {
      setRenameFile(null);
      refreshFiles();
    } else {
      alert('重命名失败');
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    setShowSearch(true);
    try {
      const results = await searchFiles('/', searchQuery.trim(), 50);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleNavigateToSearchResult = (file: FileItem) => {
    setShowSearch(false);
    setSearchQuery('');
    setSearchResults([]);
    if (file.type === 'folder') {
      setCurrentPath(file.path);
    } else {
      const parts = file.path.split('/');
      parts.pop();
      const parentPath = parts.join('/') || '/';
      setCurrentPath(parentPath);
    }
  };

  const getMimeFromExt = (name: string): string => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    const mimes: Record<string, string> = {
      jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif',
      webp: 'image/webp', bmp: 'image/bmp', svg: 'image/svg+xml',
      mp4: 'video/mp4', webm: 'video/webm', '3gp': 'video/3gpp', mkv: 'video/x-matroska',
      mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', flac: 'audio/flac', aac: 'audio/aac',
      txt: 'text/plain', md: 'text/plain', json: 'application/json', xml: 'text/xml',
      html: 'text/html', css: 'text/css', js: 'text/javascript', log: 'text/plain',
      csv: 'text/csv',
    };
    return mimes[ext] || '';
  };

  const isTextFile = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase() || '';
    return ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'log', 'csv', 'yml', 'yaml', 'ini', 'cfg', 'conf'].includes(ext);
  };

  const handlePreviewFile = async (file: FileItem) => {
    if (file.size > 100 * 1024 * 1024) {
      setPreviewFile(file);
      setPreviewType('info');
      return;
    }

    setPreviewFile(file);
    setPreviewType('loading');
    setPreviewData('');

    try {
      const cleanPath = file.path.startsWith('/') ? file.path.substring(1) : file.path;
      const result = await Filesystem.readFile({
        path: cleanPath,
        directory: Directory.ExternalStorage,
      });
      const data = (result.data as string) || '';

      const mime = getMimeFromExt(file.name);
      if (mime.startsWith('image/')) {
        setPreviewData(`data:${mime};base64,${data}`);
        setPreviewType('image');
      } else if (mime.startsWith('video/')) {
        try {
          const binary = atob(data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: mime });
          setPreviewData(URL.createObjectURL(blob));
          setPreviewType('video');
        } catch {
          setPreviewType('info');
        }
      } else if (mime.startsWith('audio/')) {
        try {
          const binary = atob(data);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: mime });
          setPreviewData(URL.createObjectURL(blob));
          setPreviewType('video');
        } catch {
          setPreviewType('info');
        }
      } else if (isTextFile(file.name)) {
        try {
          const decoded = decodeURIComponent(escape(atob(data)));
          setPreviewData(decoded.substring(0, 50000));
          setPreviewType('text');
        } catch {
          setPreviewData(data);
          setPreviewType('text');
        }
      } else {
        setPreviewType('info');
      }
    } catch (e) {
      console.error('Preview failed:', e);
      setPreviewType('info');
    }
  };

  const quickAccessItems = [
    { icon: Star, label: '收藏夹', color: 'text-yellow-500' },
    { icon: Download, label: '下载', color: 'text-blue-500' },
    { icon: HardDrive, label: '内部存储', color: 'text-green-500' },
    { icon: Clock, label: '最近', color: 'text-purple-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* 顶部工具栏 */}
      <div className="bg-white border-b border-gray-200 px-4">
        {isMultiSelect ? (
          /* 多选模式工具栏 */
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={clearSelection}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft size={24} />
              </button>
              <span className="text-lg font-medium">{selectedFiles.size} 已选择</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="全选"
              >
                <CheckSquare size={24} />
              </button>
              <button
                onClick={copyFiles}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="复制"
              >
                <Copy size={24} />
              </button>
              <button
                onClick={cutFiles}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="剪切"
              >
                <Scissors size={24} />
              </button>
              <button
                onClick={deleteSelected}
                className="p-2 hover:bg-red-100 rounded-full text-red-500"
                title="删除"
              >
                <Trash2 size={24} />
              </button>
            </div>
          </div>
        ) : (
          /* 普通模式工具栏 */
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <Menu size={24} />
              </button>
              <h1 className="text-lg font-semibold">文件管理器</h1>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setShowSearch(true)} className="p-2 hover:bg-gray-100 rounded-full">
                <Search size={24} />
              </button>
              <button onClick={() => setShowNewFolder(true)} className="p-2 hover:bg-gray-100 rounded-full" title="新建文件夹">
                <FolderPlus size={24} />
              </button>
              <button
                onClick={refreshFiles}
                className="p-2 hover:bg-gray-100 rounded-full"
                title="刷新"
              >
                <RefreshCw size={24} className={isLoading ? 'animate-spin' : ''} />
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                {viewMode === 'grid' ? <List size={24} /> : <Grid size={24} />}
              </button>
              <button onClick={toggleMultiSelect} className="p-2 hover:bg-gray-100 rounded-full">
                <MoreVertical size={24} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 路径栏 */}
      {!isMultiSelect && (
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center overflow-x-auto">
          {currentPath !== '/' && (
            <button
              onClick={goBack}
              className="p-1 hover:bg-gray-200 rounded mr-2 flex-shrink-0"
            >
              <ChevronLeft size={20} />
            </button>
          )}
          <span className="text-gray-600 text-sm whitespace-nowrap">{currentPath}</span>
        </div>
      )}

      {/* 剪贴板提示 */}
      {clipboard.files.length > 0 && !isMultiSelect && (
        <div className="bg-blue-50 border-b border-blue-100 px-4 py-2 flex items-center justify-between">
          <span className="text-sm text-blue-700">
            {clipboard.files.length} 个文件已{clipboard.type === 'copy' ? '复制' : '剪切'}
          </span>
          <button
            onClick={pasteFiles}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
          >
            粘贴
          </button>
        </div>
      )}

      {/* 新文件夹输入 */}
      {showNewFolder && !isMultiSelect && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <Folder size={20} className="text-blue-500 flex-shrink-0" />
          <input
            autoFocus
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleCreateFolder(); if (e.key === 'Escape') setShowNewFolder(false); }}
            placeholder="文件夹名称"
            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500"
          />
          <button onClick={handleCreateFolder} className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg">确定</button>
          <button onClick={() => setShowNewFolder(false)} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} />
          </button>
        </div>
      )}

      {/* 重命名输入 */}
      {renameFile && !isMultiSelect && (
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-2">
          <PenLine size={20} className="text-purple-500 flex-shrink-0" />
          <input
            autoFocus
            value={renameName}
            onChange={e => setRenameName(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleConfirmRename(); if (e.key === 'Escape') setRenameFile(null); }}
            className="flex-1 px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-purple-500"
          />
          <button onClick={handleConfirmRename} className="px-3 py-1 bg-purple-500 text-white text-sm rounded-lg">确定</button>
          <button onClick={() => setRenameFile(null)} className="p-1 hover:bg-gray-100 rounded">
            <X size={18} />
          </button>
        </div>
      )}

      {/* 搜索模态框 */}
      {showSearch && (
        <div className="absolute inset-0 bg-white z-50 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200">
            <button onClick={() => { setShowSearch(false); setSearchResults([]); setSearchQuery(''); }} className="p-1 hover:bg-gray-100 rounded">
              <ChevronLeft size={24} />
            </button>
            <input
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder="搜索文件..."
              className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm focus:outline-none"
            />
            <button onClick={handleSearch} className="px-3 py-2 bg-blue-500 text-white text-sm rounded-lg">搜索</button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {isSearching ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 size={24} className="animate-spin text-blue-500" />
              </div>
            ) : searchResults.length > 0 ? (
              <div className="p-2 space-y-1">
                {searchResults.map(file => {
                  const Icon = getFileIcon(file);
                  return (
                    <div
                      key={file.id}
                      onClick={() => handleNavigateToSearchResult(file)}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                    >
                      {Icon}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 truncate">{file.name}</p>
                        <p className="text-xs text-gray-400 truncate">{file.path}</p>
                      </div>
                      {file.type === 'file' && <span className="text-xs text-gray-400">{formatFileSize(file.size)}</span>}
                    </div>
                  );
                })}
              </div>
            ) : searchQuery && !isSearching ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400">
                <Search size={40} className="mb-2 opacity-50" />
                <p>未找到匹配文件</p>
              </div>
            ) : null}
          </div>
        </div>
      )}
      {showSidebar && (
        <div className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-lg z-50 flex flex-col">
          <div className="p-4 bg-blue-500 text-white">
            <h2 className="text-xl font-bold">文件管理器</h2>
            <p className="text-blue-100 text-sm mt-1">ES文件浏览器风格</p>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {quickAccessItems.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleQuickAccess(item.label)}
                >
                  <Icon size={24} className={item.color} />
                  <span className="font-medium">{item.label}</span>
                </div>
              );
            })}
            <div className="border-t border-gray-200 my-2" />
            <div className="px-3 py-2 text-xs text-gray-500 font-semibold">
              分类
            </div>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={handleCategoryNav}>
              <Image size={24} className="text-green-500" />
              <span className="font-medium">图片</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={handleCategoryNav}>
              <Video size={24} className="text-purple-500" />
              <span className="font-medium">视频</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={handleCategoryNav}>
              <Music size={24} className="text-pink-500" />
              <span className="font-medium">音乐</span>
            </div>
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-gray-100 cursor-pointer" onClick={handleCategoryNav}>
              <FileText size={24} className="text-yellow-600" />
              <span className="font-medium">文档</span>
            </div>
          </div>
        </div>
      )}

      {/* 文件列表 */}
      <div className="flex-1 overflow-y-auto p-2">
        {/* 预览弹窗 */}
        {previewFile && (
          <div className="absolute inset-0 bg-black/80 z-50 flex flex-col" onClick={() => { setPreviewFile(null); setPreviewData(''); }}>
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
              {previewType === 'loading' && (
                <Loader2 size={40} className="animate-spin text-white" />
              )}
              {previewType === 'image' && previewData && (
                <img src={previewData} alt={previewFile.name} className="max-w-full max-h-full object-contain" />
              )}
              {previewType === 'video' && previewData && (
                <video src={previewData} controls autoPlay className="max-w-full max-h-full rounded-lg" />
              )}
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
                      <div className="flex justify-between"><span className="text-gray-500">类型</span><span className="font-medium">{previewFile.extension?.toUpperCase() || '未知'} {previewFile.category || ''}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">修改时间</span><span className="font-medium">{previewFile.modified.toLocaleString()}</span></div>
                    </div>
                    <p className="text-xs text-gray-400 mt-4">不支持预览此格式</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        {permissionError && (
          <div className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Shield className="text-amber-500 flex-shrink-0 mt-0.5" size={24} />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800 mb-1">需要存储权限</h3>
                <p className="text-sm text-amber-700 mb-3">
                  {permissionError}。请在设置中授予权限以访问文件。
                </p>
                <button
                  onClick={handlePermissionRetry}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
                >
                  请求权限
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400">
            <Folder size={64} className="mb-4 opacity-50" />
            <p>该目录为空</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 gap-2">
            {sortedFiles.map((file) => {
              const isSelected = selectedFiles.has(file.id);
              return (
                <div
                  key={file.id}
                  onClick={(e) => handleFileClick(file, e)}
                  onContextMenu={(e) => handleLongPress(file, e)}
                  className={`
                    flex flex-col items-center p-3 rounded-xl cursor-pointer transition-all
                    ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="relative">
                    {getFileIcon(file)}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                        <CheckCircle2 size={16} className="text-white" />
                      </div>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-700 text-center line-clamp-2">
                    {file.name}
                  </p>
                  {file.type === 'file' && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-1">
            {sortedFiles.map((file) => {
              const isSelected = selectedFiles.has(file.id);
              return (
                <div
                  key={file.id}
                  onClick={(e) => handleFileClick(file, e)}
                  onContextMenu={(e) => handleLongPress(file, e)}
                  className={`
                    group flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
                    ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
                  `}
                >
                  <div className="relative flex-shrink-0">
                    {getFileIcon(file)}
                    {isSelected && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 rounded-full p-0.5">
                        <CheckCircle2 size={14} className="text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-700 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {file.type === 'folder' ? '文件夹' : formatFileSize(file.size)}
                      {' · '}{file.modified.toLocaleDateString()}
                    </p>
                  </div>
                  {!isMultiSelect && (
                    <button
                      onClick={e => { e.stopPropagation(); handleStartRename(file); }}
                      className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100"
                    >
                      <PenLine size={14} className="text-gray-400" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FileExplorer;
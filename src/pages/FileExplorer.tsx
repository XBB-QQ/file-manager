import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '../store/useFileStore';
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
  Star,
  Clock,
  Download,
  HardDrive,
  CheckSquare,
  RefreshCw,
  AlertCircle,
  Shield,
  X,
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
      default: alert('功能开发中'); break;
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
              <button className="p-2 hover:bg-gray-100 rounded-full">
                <Search size={24} />
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
              <button className="p-2 hover:bg-gray-100 rounded-full">
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

      {/* 侧边栏 */}
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
                    flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
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
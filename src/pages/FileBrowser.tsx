import { useState } from 'react';
import { useFileStore } from '../store/useFileStore';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Music,
  Video,
  Archive,
  Smartphone,
  ChevronLeft,
  Grid,
  List,
  Trash2,
} from 'lucide-react';
import { FileItem } from '../types';
import { formatFileSize } from '../utils/fileUtils';

const FileBrowser = () => {
  const {
    currentPath,
    files,
    viewMode,
    setViewMode,
    navigateToFolder,
    goBack,
    deleteFile,
  } = useFileStore();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="text-blue-500" size={32} />;
    }
    
    switch (file.category) {
      case 'image':
        return <ImageIcon className="text-green-500" size={32} />;
      case 'video':
        return <Video className="text-purple-500" size={32} />;
      case 'audio':
        return <Music className="text-pink-500" size={32} />;
      case 'document':
        return <FileText className="text-yellow-600" size={32} />;
      case 'apk':
        return <Smartphone className="text-green-600" size={32} />;
      case 'archive':
        return <Archive className="text-orange-500" size={32} />;
      default:
        return <FileText className="text-gray-500" size={32} />;
    }
  };

  const handleFileClick = (file: FileItem) => {
    if (file.type === 'folder') {
      navigateToFolder(file);
    } else {
      setSelectedFile(file.id);
    }
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentPath !== '/' && (
              <button
                onClick={goBack}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold text-gray-800">文件浏览</h1>
              <p className="text-sm text-gray-500">{currentPath}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {files.map((file) => (
              <div
                key={file.id}
                onClick={() => handleFileClick(file)}
                className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all cursor-pointer border border-gray-100 hover:border-blue-200"
              >
                <div className="flex flex-col items-center text-center">
                  {getFileIcon(file)}
                  <p className="mt-3 text-sm font-medium text-gray-700 truncate w-full">
                    {file.name}
                  </p>
                  {file.type === 'file' && (
                    <p className="text-xs text-gray-400 mt-1">
                      {formatFileSize(file.size)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    名称
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    大小
                  </th>
                  <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    修改时间
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {files.map((file) => (
                  <tr
                    key={file.id}
                    onClick={() => handleFileClick(file)}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {getFileIcon(file)}
                        <span className="text-sm font-medium text-gray-700">
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {file.type === 'file' ? formatFileSize(file.size) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-500">
                        {file.modified.toLocaleDateString('zh-CN')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFile(file.id);
                        }}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileBrowser;

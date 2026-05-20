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
  Clock
} from 'lucide-react';
import { useFileStore } from '../store/useFileStore';
import { formatFileSize } from '../utils/fileUtils';

const Categories = () => {
  const { files } = useFileStore();

  const categories = [
    { 
      id: 'image', 
      label: '图片', 
      icon: ImageIcon, 
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200'
    },
    { 
      id: 'video', 
      label: '视频', 
      icon: Video, 
      color: 'text-purple-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200'
    },
    { 
      id: 'document', 
      label: '文档', 
      icon: FileText, 
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200'
    },
    { 
      id: 'audio', 
      label: '音乐', 
      icon: Music, 
      color: 'text-pink-500',
      bgColor: 'bg-pink-50',
      borderColor: 'border-pink-200'
    },
    { 
      id: 'apk', 
      label: '应用', 
      icon: Smartphone, 
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'archive', 
      label: '压缩包', 
      icon: Archive, 
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200'
    },
  ];

  const quickAccess = [
    { icon: Star, label: '收藏夹', color: 'text-yellow-500' },
    { icon: Download, label: '下载', color: 'text-blue-500' },
    { icon: HardDrive, label: '内部存储', color: 'text-green-500' },
    { icon: Clock, label: '最近文件', color: 'text-purple-500' },
  ];

  const getCategoryStats = (categoryId: string) => {
    const categoryFiles = files.filter(
      (file) => file.type === 'file' && file.category === categoryId
    );
    const totalSize = categoryFiles.reduce((sum, file) => sum + file.size, 0);
    return { count: categoryFiles.length, size: totalSize };
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 顶部 */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center h-14">
          <h1 className="text-lg font-semibold">文件分类</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* 快捷访问 */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">快捷访问</h2>
          <div className="grid grid-cols-4 gap-2">
            {quickAccess.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
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

        {/* 文件分类 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">文件类型</h2>
          <div className="grid grid-cols-3 gap-3">
            {categories.map((category) => {
              const Icon = category.icon;
              const stats = getCategoryStats(category.id);
              
              return (
                <div
                  key={category.id}
                  className={`flex flex-col items-center p-4 bg-white rounded-xl shadow-sm border ${category.borderColor} hover:shadow-md transition-all cursor-pointer`}
                >
                  <div className={`p-4 rounded-2xl ${category.bgColor}`}>
                    <Icon size={36} className={category.color} />
                  </div>
                  <p className="font-semibold text-gray-700 mt-3">{category.label}</p>
                  <p className="text-xs text-gray-400 mt-1">{stats.count} 个</p>
                  <p className="text-sm font-medium text-gray-600 mt-1">
                    {formatFileSize(stats.size)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* 存储信息 */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">存储信息</h2>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-600">内部存储</span>
              <span className="text-sm font-medium">128 GB</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full"
                style={{ width: '65%' }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>已使用 82 GB</span>
              <span>可用 46 GB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Categories;

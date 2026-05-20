import { useEffect, useState } from 'react';
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
import { formatFileSize } from '../utils/fileUtils';
import { getRealFiles } from '../services/systemInfo';
import { FileCategory } from '../types';

const Categories = () => {
  const [categoryStats, setCategoryStats] = useState<Record<string, { count: number; size: number }>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCategoryStats();
  }, []);

  const loadCategoryStats = async () => {
    setIsLoading(true);
    try {
      const stats: Record<string, { count: number; size: number }> = {
        image: { count: 0, size: 0 },
        video: { count: 0, size: 0 },
        audio: { count: 0, size: 0 },
        document: { count: 0, size: 0 },
        apk: { count: 0, size: 0 },
        archive: { count: 0, size: 0 },
      };

      const dirs = ['Pictures', 'DCIM', 'Download', 'Documents', 'Music', 'Movies'];

      for (const dir of dirs) {
        try {
          const files = await getRealFiles(dir);
          
          for (const file of files) {
            if (file.type === 'file') {
              const ext = file.name.split('.').pop()?.toLowerCase() || '';
              
              if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) {
                stats.image.count++;
                stats.image.size += file.size;
              } else if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'mkv', 'webm'].includes(ext)) {
                stats.video.count++;
                stats.video.size += file.size;
              } else if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'm4a'].includes(ext)) {
                stats.audio.count++;
                stats.audio.size += file.size;
              } else if (['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt'].includes(ext)) {
                stats.document.count++;
                stats.document.size += file.size;
              } else if (ext === 'apk') {
                stats.apk.count++;
                stats.apk.size += file.size;
              } else if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext)) {
                stats.archive.count++;
                stats.archive.size += file.size;
              }
            }
          }
        } catch (e) {
          console.log('Cannot scan:', dir);
        }
      }

      setCategoryStats(stats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

  const totalSize = Object.values(categoryStats).reduce((sum, stat) => sum + stat.size, 0);
  const totalCount = Object.values(categoryStats).reduce((sum, stat) => sum + stat.count, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center h-14">
          <h1 className="text-lg font-semibold">文件分类</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="bg-blue-500 rounded-xl p-4 text-white mb-6">
              <p className="text-blue-100 text-sm">已扫描文件</p>
              <p className="text-2xl font-bold mt-1">{totalCount} 个文件</p>
              <p className="text-blue-100 text-sm mt-1">共占用 {formatFileSize(totalSize)}</p>
            </div>

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

            <div>
              <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">文件类型</h2>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const Icon = category.icon;
                  const stats = categoryStats[category.id] || { count: 0, size: 0 };
                  
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
          </>
        )}
      </div>
    </div>
  );
};

export default Categories;
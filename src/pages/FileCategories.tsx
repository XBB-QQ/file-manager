import {
  Image as ImageIcon,
  Video,
  FileText,
  Music,
  Smartphone,
  Archive,
  Folder,
} from 'lucide-react';
import { useFileStore } from '@/store/useFileStore';
import { formatFileSize } from '@/utils/fileUtils';

const FileCategories = () => {
  const { files } = useFileStore();

  const categories = [
    { id: 'image', label: '图片', icon: ImageIcon, color: 'text-green-600', bgColor: 'bg-green-100' },
    { id: 'video', label: '视频', icon: Video, color: 'text-purple-600', bgColor: 'bg-purple-100' },
    { id: 'document', label: '文档', icon: FileText, color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
    { id: 'audio', label: '音频', icon: Music, color: 'text-pink-600', bgColor: 'bg-pink-100' },
    { id: 'apk', label: '安装包', icon: Smartphone, color: 'text-blue-600', bgColor: 'bg-blue-100' },
    { id: 'archive', label: '压缩包', icon: Archive, color: 'text-orange-600', bgColor: 'bg-orange-100' },
  ];

  const getCategoryStats = (categoryId: string) => {
    const categoryFiles = files.filter(
      (file) => file.type === 'file' && file.category === categoryId
    );
    const totalSize = categoryFiles.reduce((sum, file) => sum + file.size, 0);
    return { count: categoryFiles.length, size: totalSize };
  };

  return (
    <div className="flex-1 bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">文件分类</h1>
          <p className="text-sm text-gray-500">按类型浏览和管理您的文件</p>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            const stats = getCategoryStats(category.id);
            
            return (
              <div
                key={category.id}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer hover:border-blue-200"
              >
                <div className={`${category.bgColor} w-14 h-14 rounded-xl flex items-center justify-center mb-4`}>
                  <Icon size={28} className={category.color} />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">{category.label}</h3>
                <p className="text-sm text-gray-500 mt-1">{stats.count} 个文件</p>
                <p className="text-sm font-medium text-blue-600 mt-2">
                  {formatFileSize(stats.size)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800">所有文件</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {files
              .filter((file) => file.type === 'file')
              .map((file) => {
                const category = categories.find((c) => c.id === file.category);
                const Icon = category?.icon || Folder;
                
                return (
                  <div
                    key={file.id}
                    className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors"
                  >
                    {category && (
                      <div className={`${category.bgColor} w-10 h-10 rounded-lg flex items-center justify-center`}>
                        <Icon size={20} className={category.color} />
                      </div>
                    )}
                    <div className="flex-1">
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} · {category?.label}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileCategories;

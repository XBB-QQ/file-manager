import { useFileStore } from '../store/useFileStore';
import { HardDrive, Trash2, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';

const StorageAnalysis = () => {
  const { storageStats, largeFiles } = useFileStore();

  const usedPercent = (storageStats.used / storageStats.total) * 100;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center h-14">
          <h1 className="text-lg font-semibold">存储分析</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">存储空间概览</h2>
            
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">已使用</span>
                <span className="text-sm font-bold text-gray-800">
                  {formatFileSize(storageStats.used)} / {formatFileSize(storageStats.total)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full"
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                <span>{usedPercent.toFixed(1)}% 已使用</span>
                <span>{formatFileSize(storageStats.available)} 可用</span>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4">
              {storageStats.breakdown.map((item, index) => (
                <div key={index} className="text-center">
                  <div
                    className="w-12 h-12 rounded-full mx-auto mb-2"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-xs font-medium text-gray-700">{item.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(item.value)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <HardDrive size={32} className="mb-4 opacity-80" />
            <p className="text-blue-100 text-sm">总容量</p>
            <p className="text-3xl font-bold mt-1">{formatFileSize(storageStats.total)}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <AlertCircle size={32} className="mb-4 opacity-80" />
            <p className="text-purple-100 text-sm">可用空间</p>
            <p className="text-3xl font-bold mt-1">{formatFileSize(storageStats.available)}</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800">大文件</h2>
            <p className="text-sm text-gray-500 mt-1">快速识别占用空间最大的文件</p>
          </div>
          
          <div className="divide-y divide-gray-100">
            {largeFiles.map((file) => (
              <div key={file.id} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-100 rounded-lg">
                    <AlertCircle size={24} className="text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">{file.name}</p>
                    <p className="text-sm text-gray-500">{file.path}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <span className="text-lg font-bold text-red-600">{formatFileSize(file.size)}</span>
                  <button className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StorageAnalysis;

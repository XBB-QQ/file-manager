import { useEffect, useState } from 'react';
import { getStorageBreakdown, scanLargeFiles, FileInfo } from '../services/systemInfo';
import { HardDrive, Trash2, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';

const StorageAnalysis = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [storageStats, setStorageStats] = useState({
    total: 0,
    used: 0,
    available: 0,
    breakdown: [] as { name: string; value: number; color: string }[]
  });
  const [largeFiles, setLargeFiles] = useState<FileInfo[]>([]);

  useEffect(() => {
    loadStorageData();
  }, []);

  const loadStorageData = async () => {
    setIsLoading(true);
    try {
      const breakdown = await getStorageBreakdown();
      const totalUsed = breakdown.reduce((sum, item) => sum + item.value, 0);
      
      setStorageStats({
        total: totalUsed + (50 * 1024 * 1024 * 1024),
        used: totalUsed,
        available: 0,
        breakdown
      });

      const files = await scanLargeFiles(50 * 1024 * 1024);
      setLargeFiles(files.map((f, i) => ({
        ...f,
        id: `lf${i}`
      })));
    } catch (error) {
      console.error('Failed to load storage data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const usedPercent = storageStats.total > 0 ? (storageStats.used / storageStats.total) * 100 : 0;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center h-14">
          <h1 className="text-lg font-semibold">存储分析</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800 mb-6">存储空间概览</h2>
                
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-600">已使用</span>
                    <span className="text-sm font-bold text-gray-800">
                      {formatFileSize(storageStats.used)} {storageStats.total > 0 ? `/ ${formatFileSize(storageStats.total)}` : ''}
                    </span>
                  </div>
                  {storageStats.total > 0 && (
                    <>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full"
                          style={{ width: `${Math.min(usedPercent, 100)}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                        <span>{usedPercent.toFixed(1)}% 已使用</span>
                        <span>{formatFileSize(storageStats.available)} 可用</span>
                      </div>
                    </>
                  )}
                </div>

                {storageStats.breakdown.length > 0 && (
                  <div className="grid grid-cols-5 gap-4">
                    {storageStats.breakdown.filter(b => b.value > 0).map((item, index) => (
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
                )}
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                <HardDrive size={32} className="mb-4 opacity-80" />
                <p className="text-blue-100 text-sm">已扫描</p>
                <p className="text-3xl font-bold mt-1">{formatFileSize(storageStats.used)}</p>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                <AlertCircle size={32} className="mb-4 opacity-80" />
                <p className="text-purple-100 text-sm">大文件</p>
                <p className="text-3xl font-bold mt-1">{largeFiles.length} 个</p>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h2 className="text-lg font-semibold text-gray-800">大文件</h2>
                <p className="text-sm text-gray-500 mt-1">占用空间最大的文件（超过50MB）</p>
              </div>
              
              <div className="divide-y divide-gray-100">
                {largeFiles.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">
                    <p>未发现超过50MB的大文件</p>
                  </div>
                ) : (
                  largeFiles.map((file) => (
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
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default StorageAnalysis;
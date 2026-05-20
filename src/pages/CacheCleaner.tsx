import { useFileStore } from '../store/useFileStore';
import { Trash2, Search, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatFileSize } from '../utils/fileUtils';

const CacheCleaner = () => {
  const {
    cacheItems,
    isScanning,
    toggleCacheSelection,
    selectAllCache,
    clearAllCache,
    scanCache,
    cleanCache,
  } = useFileStore();

  const selectedItems = cacheItems.filter((item) => item.isSelected);
  const totalSelectedSize = selectedItems.reduce(
    (sum, item) => sum + item.cacheSize,
    0
  );

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center justify-between h-14">
          <div>
            <h1 className="text-lg font-semibold">缓存清理</h1>
            <p className="text-sm text-gray-500">扫描并清理应用缓存，释放存储空间</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={scanCache}
              disabled={isScanning}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              <Search size={18} />
              {isScanning ? '扫描中...' : '重新扫描'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">可释放空间</p>
              <p className="text-3xl font-bold mt-2">{formatFileSize(totalSelectedSize)}</p>
              <p className="text-blue-100 text-sm mt-1">已选择 {selectedItems.length} 项</p>
            </div>
            <button
              onClick={cleanCache}
              disabled={selectedItems.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-white text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 size={20} />
              一键清理
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={selectAllCache}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            全选
          </button>
          <button
            onClick={clearAllCache}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            取消全选
          </button>
        </div>

        <div className="space-y-4">
          {cacheItems.map((item) => (
            <div
              key={item.id}
              className={`bg-white rounded-xl p-4 shadow-sm border transition-all ${
                item.isSelected ? 'border-blue-300 bg-blue-50' : 'border-gray-100'
              }`}
            >
              <div className="flex items-start gap-4">
                <button
                  onClick={() => toggleCacheSelection(item.id)}
                  className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                    item.isSelected
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300 hover:border-blue-400'
                  }`}
                >
                  {item.isSelected && <CheckCircle2 size={16} className="text-white" />}
                </button>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Smartphone size={24} className="text-gray-400" />
                    <h3 className="font-semibold text-gray-700">{item.appName}</h3>
                  </div>
                  <p className="text-sm text-blue-600 font-medium mt-1">
                    {formatFileSize(item.cacheSize)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{item.cacheType}</p>
                  <p className="text-xs text-gray-400 mt-2 font-mono">{item.cachePath}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-amber-500 flex-shrink-0 mt-0.5" size={20} />
          <div className="text-sm text-amber-800">
            <p className="font-medium">注意事项</p>
            <p className="mt-1">
              清理缓存不会删除您的个人数据，但可能会清除应用的临时文件和离线内容。
              某些应用重新打开时可能需要重新加载资源。
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CacheCleaner;

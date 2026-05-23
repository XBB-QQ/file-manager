import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { App } from '@capacitor/app';
import {
  Trash2,
  HardDrive,
  Shield,
  Wifi,
  Search,
  Settings,
  Cloud,
  Battery,
  Cpu,
  Network,
  Bluetooth,
  Scan,
  Smartphone,
  Folder,
  RefreshCw,
} from 'lucide-react';
import { getStorageBreakdown, scanLargeFiles } from '../services/systemInfo';
import { deleteFileOrFolder } from '../services/filesystem';
import { formatFileSize } from '../utils/fileUtils';
import { useFileStore } from '../store/useFileStore';

interface CacheItem {
  name: string;
  size: number;
  path: string;
}

const cacheDirectories = [
  { name: '下载文件', dirs: ['Download'], color: 'text-blue-500' },
];

const Tools = () => {
  const navigate = useNavigate();
  const { hasPermission, requestPermissions } = useFileStore();
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'storage' | 'large'>('storage');
  const [storageBreakdown, setStorageBreakdown] = useState<{ name: string; value: number; color: string }[]>([]);
  const [largeFiles, setLargeFiles] = useState<{ name: string; size: number; path: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cacheItems, setCacheItems] = useState<CacheItem[]>([]);
  const [isCleaning, setIsCleaning] = useState(false);
  const [cleaned, setCleaned] = useState(0);

  const ensurePermission = async () => {
    if (!hasPermission) {
      const granted = await requestPermissions();
      return granted;
    }
    return true;
  };

  const loadStorageInfo = async () => {
    setIsLoading(true);
    try {
      const breakdown = await getStorageBreakdown();
      setStorageBreakdown(breakdown);
    } catch {
      setStorageBreakdown([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLargeFiles = async () => {
    setIsLoading(true);
    try {
      const files = await scanLargeFiles(50 * 1024 * 1024);
      setLargeFiles(files.map(f => ({ name: f.name, size: f.size, path: f.path })));
    } catch {
      setLargeFiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  const openStorageModal = (tab: 'storage' | 'large') => {
    setActiveTab(tab);
    setShowModal(true);
    if (tab === 'storage') loadStorageInfo();
    else loadLargeFiles();
  };

  const scanCache = async (): Promise<CacheItem[]> => {
    const items: CacheItem[] = [];
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      for (const dir of cacheDirectories) {
        for (const sub of dir.dirs) {
          try {
            const clean = sub.startsWith('/') ? sub.substring(1) : sub;
            const result = await Filesystem.readdir({ path: clean, directory: Directory.ExternalStorage });
            for (const f of result.files) {
              if (f.type === 'file') {
                const size = await getFileSize(f.name, sub);
                items.push({ name: f.name, size, path: `${sub}/${f.name}` });
              }
            }
          } catch {
            // Directory doesn't exist
          }
        }
      }
    } catch {
      // Permission error
    }
    return items;
  };

  const getFileSize = async (name: string, dir: string): Promise<number> => {
    try {
      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      const clean = (dir + '/' + name).startsWith('/') ? (dir + '/' + name).substring(1) : (dir + '/' + name);
      const stat = await Filesystem.stat({ path: clean, directory: Directory.ExternalStorage });
      return stat.size || 0;
    } catch {
      return 0;
    }
  };

  const handleCleanCache = async () => {
    const granted = await ensurePermission();
    if (!granted) {
      alert('请先授予存储权限');
      return;
    }
    setIsCleaning(true);
    setCleaned(0);
    const items = await scanCache();
    setCacheItems(items);
    setIsCleaning(false);

    if (items.length === 0) {
      alert('未发现可清理的缓存文件');
    }
  };

  const handleDeleteCacheItem = async (item: CacheItem) => {
    const parts = item.path.split('/');
    const name = parts.pop() || '';
    const parentPath = parts.join('/') || '/';
    const ok = await deleteFileOrFolder(parentPath, name, 'file');
    if (ok) {
      setCleaned(c => c + item.size);
      setCacheItems(prev => prev.filter(i => i.path !== item.path));
    }
  };

  const totalCacheSize = cacheItems.reduce((s, i) => s + i.size, 0);

  const showComingSoon = () => alert('功能开发中');

  const tools = [
    { id: 1, icon: Trash2, label: '垃圾清理', color: 'text-red-500', desc: '清理缓存和无用文件', action: handleCleanCache },
    { id: 2, icon: HardDrive, label: '存储分析', color: 'text-blue-500', desc: '分析磁盘空间使用', action: () => openStorageModal('storage') },
    { id: 3, icon: Shield, label: '安全扫描', color: 'text-green-500', desc: '扫描大文件与重复文件', action: () => openStorageModal('large') },
    { id: 4, icon: Wifi, label: '网络分析', color: 'text-purple-500', desc: '查看网络连接', action: showComingSoon },
    { id: 5, icon: Search, label: '文件搜索', color: 'text-orange-500', desc: '快速搜索文件', action: () => navigate('/') },
    { id: 6, icon: Settings, label: '应用管理', color: 'text-pink-500', desc: '跳转系统设置', action: () => { try { App.minimizeApp() } catch { alert('无法打开设置'); } } },
    { id: 7, icon: Cloud, label: '云存储', color: 'text-cyan-500', desc: '访问云端文件', action: showComingSoon },
    { id: 8, icon: Battery, label: '电池优化', color: 'text-yellow-500', desc: '查看存储占用', action: () => openStorageModal('storage') },
    { id: 9, icon: Cpu, label: '进程管理', color: 'text-indigo-500', desc: '清理缓存文件', action: handleCleanCache },
    { id: 10, icon: Network, label: 'FTP服务', color: 'text-teal-500', desc: '远程访问文件', action: showComingSoon },
    { id: 11, icon: Bluetooth, label: '蓝牙传输', color: 'text-violet-500', desc: '蓝牙文件分享', action: showComingSoon },
    { id: 12, icon: Scan, label: '大文件扫描', color: 'text-emerald-500', desc: '扫描大文件', action: () => openStorageModal('large') },
  ];

  const totalSize = storageBreakdown.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center h-14">
          <h1 className="text-lg font-semibold">工具</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isCleaning ? (
          <div className="flex items-center justify-center py-12">
            <RefreshCw size={32} className="animate-spin text-blue-500 mr-3" />
            <span className="text-gray-500">正在扫描可清理文件...</span>
          </div>
        ) : cacheItems.length > 0 ? (
          <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-600">
                可清理文件 ({cacheItems.length} 项, {formatFileSize(totalCacheSize)})
              </h2>
              <button
                onClick={() => { setCacheItems([]); setCleaned(0); }}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                关闭
              </button>
            </div>
            {cleaned > 0 && (
              <div className="mb-2 px-3 py-2 bg-green-50 text-green-700 text-sm rounded-lg">
                已清理 {formatFileSize(cleaned)}
              </div>
            )}
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {cacheItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50">
                  <Folder size={16} className="text-gray-400 flex-shrink-0" />
                  <span className="flex-1 text-sm text-gray-700 truncate">{item.name}</span>
                  <span className="text-xs text-gray-400">{formatFileSize(item.size)}</span>
                  <button
                    onClick={() => handleDeleteCacheItem(item)}
                    className="px-2 py-1 text-xs text-red-500 hover:bg-red-50 rounded"
                  >
                    删除
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">快速操作</h2>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-all"
              onClick={handleCleanCache}
            >
              <Trash2 size={32} className="mb-2" />
              <p className="font-semibold">垃圾清理</p>
              <p className="text-xs text-red-100 mt-1">清理缓存文件</p>
            </div>
            <div
              className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-all"
              onClick={() => openStorageModal('storage')}
            >
              <HardDrive size={32} className="mb-2" />
              <p className="font-semibold">存储分析</p>
              <p className="text-xs text-blue-100 mt-1">分析空间使用</p>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">所有工具</h2>
          <div className="grid grid-cols-3 gap-3">
            {tools.map(tool => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
                  onClick={tool.action}
                >
                  <div className={`p-3 rounded-xl ${tool.color.replace('text-', 'bg-').replace('500', '100')}`}>
                    <Icon size={28} className={tool.color} />
                  </div>
                  <p className="font-medium text-gray-700 mt-3 text-sm">{tool.label}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2">{tool.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
          <div className="bg-white w-full max-w-md mx-4 rounded-xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-4 text-white">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">{activeTab === 'storage' ? '存储分析' : '大文件扫描'}</h2>
                <button onClick={() => setShowModal(false)} className="text-white/80 hover:text-white text-xl leading-none">&times;</button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => { setActiveTab('storage'); loadStorageInfo(); }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${activeTab === 'storage' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  存储分析
                </button>
                <button
                  onClick={() => { setActiveTab('large'); loadLargeFiles(); }}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${activeTab === 'large' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                >
                  大文件
                </button>
              </div>
              {activeTab === 'storage' ? (
                isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw size={24} className="animate-spin text-blue-500" />
                  </div>
                ) : storageBreakdown.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Folder size={48} className="mx-auto mb-2 opacity-50" />
                    <p>需要存储权限</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {storageBreakdown.map(item => (
                      <div key={item.name} className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <span className="text-sm font-medium text-gray-700">{item.name}</span>
                            <span className="text-sm text-gray-500">{formatFileSize(item.value)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                            <div
                              className="h-2 rounded-full transition-all"
                              style={{ width: totalSize > 0 ? `${(item.value / totalSize) * 100}%` : '0%', backgroundColor: item.color }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                isLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <RefreshCw size={24} className="animate-spin text-blue-500" />
                  </div>
                ) : largeFiles.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Folder size={48} className="mx-auto mb-2 opacity-50" />
                    <p>未找到大文件 ({'>'}50MB)</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-80 overflow-y-auto">
                    {largeFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Smartphone size={20} className="text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                          <p className="text-xs text-gray-400 truncate">{file.path}</p>
                        </div>
                        <span className="text-sm text-blue-500 font-medium">{formatFileSize(file.size)}</span>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tools;
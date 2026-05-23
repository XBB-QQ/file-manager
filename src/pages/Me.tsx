import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFileStore } from '../store/useFileStore';
import {
  User,
  Settings,
  Palette,
  Shield,
  HelpCircle,
  Info,
  Moon,
  Bell,
  Download,
  Star,
  Share2,
  LogOut,
  RefreshCw,
  HardDrive,
  Folder,
  FileText,
} from 'lucide-react';
import { getRealFiles } from '../services/systemInfo';
import { formatFileSize } from '../utils/fileUtils';

const showComingSoon = () => alert('功能开发中');

const Me = () => {
  const navigate = useNavigate();
  const { requestPermissions, hasPermission } = useFileStore();
  const [stats, setStats] = useState({ files: 0, folders: 0, size: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

  const scanDir = async (dir: string): Promise<{ count: number; size: number }> => {
    try {
      const files = await getRealFiles(dir);
      const totalSize = files.reduce((sum, f) => sum + (f.size || 0), 0);
      return { count: files.length, size: totalSize };
    } catch {
      return { count: 0, size: 0 };
    }
  };

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const dirs = ['Pictures', 'Download', 'Documents', 'Music', 'Movies'];
      let totalFiles = 0;
      let totalFolders = 0;
      let totalSize = 0;

      for (const dir of dirs) {
        const result = await scanDir(dir);
        totalFiles += result.count;
        totalSize += result.size;
      }

      const { Filesystem, Directory } = await import('@capacitor/filesystem');
      try {
        const root = await Filesystem.readdir({ path: '', directory: Directory.ExternalStorage });
        totalFolders = root.files.filter(f => f.type === 'directory').length;
      } catch {
        totalFolders = 0;
      }

      setStats({ files: totalFiles, folders: totalFolders, size: totalSize });
      setPermissionError(false);
    } catch {
      setPermissionError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestPermissions().then(granted => {
      if (granted) {
        loadStats();
      } else {
        setPermissionError(true);
        setIsLoading(false);
      }
    });
  }, []);

  const handleRefresh = () => {
    if (!hasPermission) {
      requestPermissions().then(granted => {
        if (granted) loadStats();
        else setPermissionError(true);
      });
    } else {
      loadStats();
    }
  };

  const menuItems = [
    { icon: Settings, label: '设置', color: 'text-blue-500', onClick: showComingSoon },
    { icon: Palette, label: '主题', color: 'text-purple-500', onClick: showComingSoon },
    { icon: Moon, label: '深色模式', color: 'text-indigo-500', onClick: showComingSoon },
    { icon: Bell, label: '通知', color: 'text-orange-500', onClick: showComingSoon },
    { icon: Shield, label: '隐私', color: 'text-green-500', onClick: showComingSoon },
    { icon: Download, label: '下载管理', color: 'text-cyan-500', onClick: () => navigate('/') },
    { icon: Star, label: '收藏', color: 'text-yellow-500', onClick: showComingSoon },
    { icon: Share2, label: '分享', color: 'text-pink-500', onClick: showComingSoon },
    { icon: HelpCircle, label: '帮助', color: 'text-teal-500', onClick: showComingSoon },
    { icon: Info, label: '关于', color: 'text-gray-500', onClick: () => alert('文件管理器 v1.0\n管理你的手机文件') },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center h-14">
          <h1 className="text-lg font-semibold">我的</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
              <User size={32} />
            </div>
            <div>
              <p className="font-semibold text-xl">文件管理器</p>
              <p className="text-blue-100 text-sm">管理你的手机文件</p>
            </div>
          </div>
        </div>

        <div className="-mt-4 px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-600">存储统计</h2>
              <button onClick={handleRefresh} className="p-1 hover:bg-gray-100 rounded-full">
                <RefreshCw size={16} className="text-gray-400" />
              </button>
            </div>
            {permissionError ? (
              <div className="text-center py-4">
                <Shield size={32} className="text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">需要存储权限才能统计</p>
                <button
                  onClick={handleRefresh}
                  className="mt-2 px-4 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                  请求权限
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <FileText size={18} className="text-blue-500" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{isLoading ? '...' : stats.files.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">文件</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <Folder size={18} className="text-green-500" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{isLoading ? '...' : stats.folders}</p>
                  <p className="text-xs text-gray-400">文件夹</p>
                </div>
                <div className="text-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1">
                    <HardDrive size={18} className="text-purple-500" />
                  </div>
                  <p className="text-lg font-bold text-gray-800">{isLoading ? '...' : formatFileSize(stats.size)}</p>
                  <p className="text-xs text-gray-400">总大小</p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4">
            <div className="px-4 py-3 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-600">菜单</h2>
            </div>
            <div>
              {menuItems.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                    onClick={item.onClick}
                  >
                    <Icon size={20} className={item.color} />
                    <span className="text-sm text-gray-700">{item.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <button className="w-full mt-4 mb-6 flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl shadow-sm border border-gray-100 hover:bg-gray-50 transition-colors">
            <LogOut size={18} className="text-red-500" />
            <span className="text-sm text-red-500 font-medium">退出</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Me;
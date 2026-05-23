import { useState, useEffect } from 'react';
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
  RefreshCw
} from 'lucide-react';
import { getRealFiles } from '../services/systemInfo';
import { formatFileSize } from '../utils/fileUtils';

const showComingSoon = () => alert('功能开发中');

const Me = () => {
  const { requestPermissions } = useFileStore();
  const [stats, setStats] = useState({ files: 0, folders: 0, size: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);

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

  const loadStats = async () => {
    setIsLoading(true);
    try {
      let totalFiles = 0;
      let totalFolders = 0;
      let totalSize = 0;

      const dirs = ['Pictures', 'DCIM', 'Download', 'Documents', 'Music', 'Movies'];

      for (const dir of dirs) {
        try {
          const files = await getRealFiles(dir);
          for (const file of files) {
            if (file.type === 'file') {
              totalFiles++;
              totalSize += file.size;
            } else {
              totalFolders++;
            }
          }
        } catch (e) {
          console.log('Cannot scan:', dir);
        }
      }

      setStats({ files: totalFiles, folders: totalFolders, size: totalSize });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const menuItems = [
    { icon: Settings, label: '设置', color: 'text-blue-500', onClick: showComingSoon },
    { icon: Palette, label: '主题', color: 'text-purple-500', onClick: showComingSoon },
    { icon: Moon, label: '深色模式', color: 'text-indigo-500', onClick: showComingSoon },
    { icon: Bell, label: '通知', color: 'text-orange-500', onClick: showComingSoon },
    { icon: Shield, label: '隐私', color: 'text-green-500', onClick: showComingSoon },
    { icon: Download, label: '下载管理', color: 'text-cyan-500', onClick: showComingSoon },
    { icon: Star, label: '收藏', color: 'text-yellow-500', onClick: showComingSoon },
    { icon: Share2, label: '分享', color: 'text-pink-500', onClick: showComingSoon },
    { icon: HelpCircle, label: '帮助', color: 'text-teal-500', onClick: showComingSoon },
    { icon: Info, label: '关于', color: 'text-gray-500', onClick: showComingSoon },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 px-4 pb-8 pt-4">
        <div className="flex items-center h-14">
          <h1 className="text-lg font-semibold text-white">我的</h1>
        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <User size={32} className="text-white" />
          </div>
          <div className="text-white">
            <p className="font-semibold text-lg">用户</p>
            <p className="text-blue-100 text-sm">手机文件管理器 v1.0</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-4 -mt-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-600">存储统计</h2>
              <button
                onClick={() => {
                  setIsLoading(true);
                  setPermissionError(false);
                  requestPermissions().then(granted => {
                    if (granted) {
                      loadStats();
                    } else {
                      setPermissionError(true);
                      setIsLoading(false);
                    }
                  });
                }}
                className="p-1 hover:bg-gray-100 rounded-full"
              >
                <RefreshCw size={16} className="text-gray-400" />
              </button>
            </div>
            {permissionError ? (
              <div className="text-center py-4">
                <Shield size={32} className="text-amber-500 mx-auto mb-2" />
                <p className="text-sm text-gray-500">需要存储权限才能统计</p>
                <button
                  onClick={() => {
                    setIsLoading(true);
                    setPermissionError(false);
                    requestPermissions().then(granted => {
                      if (granted) {
                        loadStats();
                      } else {
                        setPermissionError(true);
                        setIsLoading(false);
                      }
                    });
                  }}
                  className="mt-2 px-4 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600"
                >
                  请求权限
                </button>
              </div>
            ) : (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-500">
                  {isLoading ? '...' : stats.files}
                </p>
                <p className="text-xs text-gray-500">文件</p>
              </div>
              <div className="border-x border-gray-200">
                <p className="text-2xl font-bold text-green-500">
                  {isLoading ? '...' : stats.folders}
                </p>
                <p className="text-xs text-gray-500">文件夹</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-500">
                  {isLoading ? '...' : formatFileSize(stats.size)}
                </p>
                <p className="text-xs text-gray-500">总大小</p>
              </div>
            </div>
            )}
          </div>
        </div>

        <div className="mt-4">
          {menuItems.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                onClick={item.onClick}
              >
                <div className={`p-2 rounded-lg ${item.color.replace('text-', 'bg-').replace('500', '100')}`}>
                  <Icon size={20} className={item.color} />
                </div>
                <span className="font-medium text-gray-700">{item.label}</span>
              </div>
            );
          })}
        </div>

        <div className="p-4">
          <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-gray-100 hover:bg-red-50 cursor-pointer text-red-500">
            <div className="p-2 rounded-lg bg-red-100">
              <LogOut size={20} />
            </div>
            <span className="font-medium">退出</span>
          </div>
        </div>

        <div className="text-center py-6 text-xs text-gray-400">
          <p>文件管理器 v1.0.0</p>
          <p className="mt-1">© 2024 All Rights Reserved</p>
        </div>
      </div>
    </div>
  );
};

export default Me;

import {
  Trash2,
  HardDrive,
  Shield,
  Wifi,
  Scan,
  Settings,
  Cloud,
  Battery,
  Cpu,
  Network,
  Bluetooth
} from 'lucide-react';

const Tools = () => {
  const tools = [
    { id: 1, icon: Trash2, label: '垃圾清理', color: 'text-red-500', desc: '清理缓存和无用文件' },
    { id: 2, icon: HardDrive, label: '存储分析', color: 'text-blue-500', desc: '分析磁盘空间使用' },
    { id: 3, icon: Shield, label: '安全扫描', color: 'text-green-500', desc: '扫描恶意文件' },
    { id: 4, icon: Wifi, label: '网络分析', color: 'text-purple-500', desc: '查看网络连接' },
    { id: 5, icon: Scan, label: '文件搜索', color: 'text-orange-500', desc: '快速搜索文件' },
    { id: 6, icon: Settings, label: '应用管理', color: 'text-pink-500', desc: '管理已安装应用' },
    { id: 7, icon: Cloud, label: '云存储', color: 'text-cyan-500', desc: '访问云端文件' },
    { id: 8, icon: Battery, label: '电池优化', color: 'text-yellow-500', desc: '优化电池使用' },
    { id: 9, icon: Cpu, label: '进程管理', color: 'text-indigo-500', desc: '查看运行进程' },
    { id: 10, icon: Network, label: 'FTP服务', color: 'text-teal-500', desc: '远程访问文件' },
    { id: 11, icon: Bluetooth, label: '蓝牙传输', color: 'text-violet-500', desc: '蓝牙文件分享' },
    { id: 12, icon: Scan, label: 'APK管理', color: 'text-emerald-500', desc: '管理安装包' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* 顶部 */}
      <div className="bg-white border-b border-gray-200 px-4">
        <div className="flex items-center h-14">
          <h1 className="text-lg font-semibold">工具</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {/* 快速操作 */}
        <div className="mb-6">
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">快速操作</h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-red-400 to-red-500 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-all">
              <Trash2 size={32} className="mb-2" />
              <p className="font-semibold">垃圾清理</p>
              <p className="text-xs text-red-100 mt-1">释放存储空间</p>
            </div>
            <div className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition-all">
              <HardDrive size={32} className="mb-2" />
              <p className="font-semibold">存储分析</p>
              <p className="text-xs text-blue-100 mt-1">分析空间使用</p>
            </div>
          </div>
        </div>

        {/* 所有工具 */}
        <div>
          <h2 className="text-sm font-semibold text-gray-600 mb-3 px-1">所有工具</h2>
          <div className="grid grid-cols-3 gap-3">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div
                  key={tool.id}
                  className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer"
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
    </div>
  );
};

export default Tools;

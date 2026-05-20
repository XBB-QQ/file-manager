import { Link, useLocation } from "react-router-dom";
import { Home, Folder, Trash2, HardDrive, LayoutGrid } from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "文件浏览", icon: Home },
    { path: "/cache", label: "缓存清理", icon: Trash2 },
    { path: "/categories", label: "文件分类", icon: LayoutGrid },
    { path: "/storage", label: "存储分析", icon: HardDrive },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-screen fixed left-0 top-0 flex flex-col">
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Folder className="text-blue-400" />
          文件管理器
        </h1>
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-700">
        <div className="text-sm text-slate-400">
          <p>安卓文件管理器</p>
          <p className="mt-1">v1.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;

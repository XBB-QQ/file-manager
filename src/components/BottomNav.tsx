import { Link, useLocation } from 'react-router-dom';
import { FolderOpen, Grid, Settings, User } from 'lucide-react';

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: '文件', icon: FolderOpen },
    { path: '/categories', label: '分类', icon: Grid },
    { path: '/tools', label: '工具', icon: Settings },
    { path: '/me', label: '我的', icon: User },
  ];

  return (
    <div className="bg-white border-t border-gray-200">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center py-2 px-4 transition-all ${
                isActive ? 'text-blue-500' : 'text-gray-500'
              }`}
            >
              <Icon size={24} />
              <span className="text-xs mt-1 font-medium">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNav;

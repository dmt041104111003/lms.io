import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import authService from '@/services/authService';

interface AdminSidebarProps {
  onMenuClick?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onMenuClick }) => {
  const router = useRouter();

  const isActiveRoute = (path: string) => {
    if (path === '/admin') {
      return router.pathname === '/admin';
    }
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
      localStorage.removeItem('access_token');
      router.push('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard' },
    { path: '/admin/users', label: 'Users' },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 pt-16 flex flex-col">
      <nav className="p-4 space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = isActiveRoute(item.path);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onMenuClick}
              className={`block px-3 py-2 text-sm transition-colors border-b-2 ${
                isActive
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 space-y-1">
        <Link
          href="/home"
          onClick={onMenuClick}
          className="block px-3 py-2 text-sm transition-colors border-b-2 border-transparent text-gray-600 hover:text-gray-900"
        >
          Back to Home
        </Link>
        <button
          onClick={() => {
            handleLogout();
            if (onMenuClick) onMenuClick();
          }}
          className="w-full text-left px-3 py-2 text-sm transition-colors border-b-2 border-transparent text-gray-600 hover:text-gray-900"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;


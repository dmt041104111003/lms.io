import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import authService from '@/services/authService';

interface InstructorSidebarProps {
  onMenuClick?: () => void;
}

const InstructorSidebar: React.FC<InstructorSidebarProps> = ({ onMenuClick }) => {
  const router = useRouter();

  const isActiveRoute = (path: string) => {
    if (path === '/instructor') {
      return router.pathname === '/instructor';
    }
    // Exact match takes priority
    if (router.pathname === path) {
      return true;
    }
    // Special case for /instructor/courses - don't match /instructor/courses/create
    if (path === '/instructor/courses') {
      return router.pathname === '/instructor/courses';
    }
    // For other routes, check if it starts with the path
    return router.pathname.startsWith(path + '/');
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

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 pt-16 flex flex-col">
      <nav className="p-4 space-y-1 flex-1">
        {/* Dashboard */}
        <Link
          href="/instructor"
          onClick={onMenuClick}
          className={`block px-3 py-2 text-sm transition-colors ${
            isActiveRoute('/instructor')
              ? 'text-blue-600 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Dashboard
        </Link>

        {/* Course */}
        <div className="font-semibold text-gray-900 px-3 py-2 text-sm">
          Course
        </div>
        
        <Link
          href="/instructor/courses"
          onClick={onMenuClick}
          className={`block px-6 py-2 text-sm transition-colors ${
            isActiveRoute('/instructor/courses')
              ? 'text-blue-600 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Management
        </Link>

        <Link
          href="/instructor/courses/create"
          onClick={onMenuClick}
          className={`block px-6 py-2 text-sm transition-colors ${
            isActiveRoute('/instructor/courses/create')
              ? 'text-blue-600 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Create
        </Link>

        {/* Enrollment Management */}
        <Link
          href="/instructor/enrollment"
          onClick={onMenuClick}
          className={`block px-3 py-2 text-sm transition-colors ${
            isActiveRoute('/instructor/enrollment')
              ? 'text-blue-600 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Enrollment
        </Link>

        {/* Notifications */}
        <Link
          href="/instructor/notifications"
          onClick={onMenuClick}
          className={`block px-3 py-2 text-sm transition-colors ${
            isActiveRoute('/instructor/notifications')
              ? 'text-blue-600 font-medium'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Notifications
        </Link>
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

export default InstructorSidebar;


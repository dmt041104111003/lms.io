import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import authService from '@/services/authService';
import { 
  LayoutDashboard, 
  BookOpen, 
  PlusCircle, 
  Users, 
  Bell, 
  MessageSquare, 
  HelpCircle, 
  Home, 
  LogOut 
} from 'lucide-react';

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

  const menuItems = [
    { path: '/instructor', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/instructor/courses', label: 'Course Management', icon: BookOpen },
    { path: '/instructor/courses/create', label: 'Create Course', icon: PlusCircle },
    { path: '/instructor/enrollment', label: 'Enrollment', icon: Users },
    { path: '/instructor/notifications', label: 'Notifications', icon: Bell },
    { path: '/instructor/feedback', label: 'Feedback', icon: MessageSquare },
    { path: '/instructor/qna', label: 'Q&A', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-blue-50 min-h-screen fixed left-0 top-0 pt-16 flex flex-col shadow-2xl border-r border-gray-200">
      <nav className="p-4 space-y-2 flex-1">
        {menuItems.map((item) => {
          const isActive = isActiveRoute(item.path);
          
          return (
            <Link
              key={item.path}
              href={item.path}
              onClick={onMenuClick}
              className={`group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-300 ease-out ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600 hover:shadow-md hover:transform hover:scale-[1.02]'
              }`}
            >
              <item.icon 
                size={20} 
                className={`transition-all duration-300 ${
                  isActive ? 'text-white drop-shadow-sm' : 'text-gray-500 group-hover:text-blue-600'
                }`}
              />
              <span className="transition-all duration-300">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          href="/home"
          onClick={onMenuClick}
          className="group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-white hover:text-blue-600 transition-all duration-300 ease-out hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <Home 
            size={20} 
            className="text-gray-500 group-hover:text-blue-600 transition-all duration-300" 
          />
          <span>Back to Home</span>
        </Link>
        <button
          onClick={() => {
            handleLogout();
            if (onMenuClick) onMenuClick();
          }}
          className="w-full group flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all duration-300 ease-out hover:shadow-md hover:transform hover:scale-[1.02]"
        >
          <LogOut 
            size={20} 
            className="text-gray-500 group-hover:text-red-600 transition-all duration-300" 
          />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default InstructorSidebar;


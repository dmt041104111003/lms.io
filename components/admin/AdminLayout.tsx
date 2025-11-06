import React, { useState } from 'react';
import { useRouter } from 'next/router';
import AdminSidebar from './AdminSidebar';
import Loading from '@/components/layout/Loading';
import { useAuth } from '@/hooks/useAuth';
import Logo from '@/components/ui/logo';

interface AdminLayoutProps {
  children: React.ReactNode;
  loading?: boolean;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children, loading = false }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : '';
  const initials = user && user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.username[0]?.toUpperCase() || 'A';

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {loading && <Loading />}
      {/* Header */}
      <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-40 h-16">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-gray-700 hover:text-gray-900 p-2"
              aria-label="Toggle menu"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
            <Logo compact={false} layout="inline" showText={true} size="sm" />
          </div>
          
          <div className="flex items-center gap-3">
            {user && (
              <div className="flex items-center gap-2">
                {user.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                    {initials}
                  </div>
                )}
                <span className="hidden md:inline text-sm text-gray-700">{fullName || user.username}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex pt-16">
        {/* Sidebar - Desktop */}
        <div className="hidden lg:block">
          <AdminSidebar />
        </div>

        {/* Sidebar - Mobile */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 bottom-0 w-64 bg-white">
              <AdminSidebar onMenuClick={() => setSidebarOpen(false)} />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-64 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;


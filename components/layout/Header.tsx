import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiX, FiSearch } from 'react-icons/fi';
import Logo from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';

const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fullName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username : '';
  const initials = user && user.firstName && user.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : user?.username[0]?.toUpperCase() || 'U';

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Handle search logic here
      console.log('Search:', searchQuery);
    }
  };

  const isActiveRoute = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 lg:gap-6 h-16">
          {/* Logo */}
          <Link href="/home" className="flex items-center flex-shrink-0">
            <Logo 
              layout="inline" 
              size="sm" 
              showText={true}
              className="flex-shrink-0"
            />
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl mx-4">
            <div className="relative w-full">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, instructors..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <Link 
              href="/courses" 
              className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                isActiveRoute('/courses')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Courses
            </Link>
            <a
              href="https://cardano2vn.io"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-sm transition-colors border-b-2 border-transparent text-gray-600 hover:text-gray-900"
            >
              Blog
            </a>
          </nav>

          {/* Right side - User menu or Sign In buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {isAuthenticated && user ? (
                  /* User Menu - Desktop */
                  <div className="hidden md:flex items-center gap-3">
                    {user.role?.name === 'ADMIN' && (
                      <Link
                        href="/admin"
                        className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                          isActiveRoute('/admin')
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Admin
                      </Link>
                    )}
                    {user.role?.name === 'INSTRUCTOR' && (
                      <Link
                        href="/instructor"
                        className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                          isActiveRoute('/instructor')
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        Instructor
                      </Link>
                    )}
                    <Link 
                      href="/profile" 
                      className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors border-b-2 ${
                        isActiveRoute('/profile')
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-600 hover:text-gray-900'
                      }`}
                    >
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
                      <span className="hidden lg:inline">{fullName || user.username}</span>
                    </Link>
                  </div>
                ) : (
                  /* Sign In Button - Desktop */
                  <div className="hidden md:flex items-center gap-3">
                    <Link 
                      href="/login" 
                      className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors font-medium"
                    >
                      Sign in
                    </Link>
                    <Link 
                      href="/signup" 
                      className="px-4 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors font-medium"
                    >
                      Get started
                    </Link>
                  </div>
                )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-gray-700 hover:text-gray-900 p-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col gap-2">
              <Link 
                href="/courses" 
                className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                  isActiveRoute('/courses')
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Courses
              </Link>
              <a
                href="https://cardano2vn.io"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm transition-colors border-b-2 border-transparent text-gray-600 hover:text-gray-900"
                onClick={() => setMobileMenuOpen(false)}
              >
                Blog
              </a>

              <div className="border-t border-gray-200 mt-2 pt-2">
                {isAuthenticated && user ? (
                    <>
                      {user.role?.name === 'ADMIN' && (
                        <Link 
                          href="/admin" 
                          className={`block px-3 py-2 text-sm transition-colors border-b-2 ${
                            isActiveRoute('/admin')
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Admin
                        </Link>
                      )}
                      {user.role?.name === 'INSTRUCTOR' && (
                        <Link 
                          href="/instructor" 
                          className={`block px-3 py-2 text-sm transition-colors border-b-2 ${
                            isActiveRoute('/instructor')
                              ? 'border-blue-500 text-blue-600'
                              : 'border-transparent text-gray-600 hover:text-gray-900'
                          }`}
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          Instructor
                        </Link>
                      )}
                      <Link 
                        href="/profile" 
                        className={`flex items-center gap-2 px-3 py-2 text-sm transition-colors border-b-2 ${
                          isActiveRoute('/profile')
                            ? 'border-blue-500 text-blue-600'
                            : 'border-transparent text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
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
                        <span>{fullName || user.username}</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign in
                      </Link>
                      <Link 
                        href="/signup" 
                        className="block px-3 py-2 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors mt-2 text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get started
                      </Link>
                    </>
                  )}
                </div>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;


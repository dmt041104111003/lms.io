import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiMenu, FiX, FiMessageSquare } from 'react-icons/fi';
import Logo from '@/components/ui/logo';
import { useAuth } from '@/hooks/useAuth';
import ChatDialog from '@/components/chat/ChatDialog';

const Header: React.FC = () => {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const displayName = user ? (user.fullName?.trim() || (user.email?.split('@')[0] || '')) : '';
  const initials = user?.fullName?.trim()
    ? user.fullName.trim().split(' ').filter(Boolean).slice(0, 2).map((part: string) => part[0]).join('').toUpperCase()
    : (user?.email?.[0]?.toUpperCase() || 'U');

  

  

  

  const isActiveRoute = (path: string) => {
    return router.pathname === path || router.pathname.startsWith(path + '/');
  };

  return (
    <>
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

          

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1 flex-shrink-0">
            <Link 
              href="/home" 
              className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                isActiveRoute('/home')
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Home
            </Link>
            {isAuthenticated && (
              <Link 
                href="/my-courses" 
                className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                  isActiveRoute('/my-courses')
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                My Courses
              </Link>
            )}
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
                    <button
                      onClick={() => setChatOpen(true)}
                      className="p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                      aria-label="Open messages"
                      title="Messages"
                    >
                      <FiMessageSquare size={20} />
                    </button>
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
                          alt={displayName}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                          {initials}
                        </div>
                      )}
                      <span className="hidden lg:inline">{displayName}</span>
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

            {isAuthenticated && (
              <button
                onClick={() => setChatOpen(true)}
                className="md:hidden p-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md"
                aria-label="Open messages"
                title="Messages"
              >
                <FiMessageSquare size={20} />
              </button>
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

        
      </div>

      {/* Mobile Navigation Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          <nav className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col gap-2">
              <Link 
                href="/home" 
                className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                  isActiveRoute('/home')
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link 
                  href="/my-courses" 
                  className={`px-3 py-2 text-sm transition-colors border-b-2 ${
                    isActiveRoute('/my-courses')
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Courses
                </Link>
              )}
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
                            alt={displayName}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                            {initials}
                          </div>
                        )}
                        <span>{displayName}</span>
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
    <ChatDialog open={chatOpen} onClose={() => setChatOpen(false)} />
    </>
  );
};

export default Header;


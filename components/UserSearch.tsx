import { useState, useEffect, useRef } from 'react';
import { apiRequestFull } from '@/lib/api';
import { UserResponse } from '@/services/authService';

interface ApiResponse<T> {
  code: number;
  message: string;
  result: T;
}

interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

interface UserSearchProps {
  onUserSelect: (user: UserResponse) => void;
  placeholder?: string;
}

export default function UserSearch({ onUserSelect, placeholder = "Search users by name or email..." }: UserSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchUsers = async () => {
      if (query.trim().length < 2) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setLoading(true);
      try {
        console.log('Searching users with query:', query);
        console.log('Token:', localStorage.getItem('access_token')?.substring(0, 20) + '...');
        
        const response = await apiRequestFull<PageResponse<UserResponse>>(`/api/users?keyword=${encodeURIComponent(query)}&size=5`, {
          method: 'GET'
        });
        
        console.log('Search response:', response);
        
        if (response.code === 1000 && response.result?.content) {
          setResults(response.result.content);
          setIsOpen(true);
        } else {
          setResults([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error('Error searching users:', error);
        setResults([]);
        setIsOpen(false);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 300);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleUserClick = (user: UserResponse) => {
    onUserSelect(user);
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <div ref={searchRef} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => query.trim().length >= 2 && setIsOpen(true)}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
      
      {loading && (
        <div className="absolute right-3 top-2.5">
          <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
        </div>
      )}

      {isOpen && results.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((user) => (
            <div
              key={user.id}
              onClick={() => handleUserClick(user)}
              className="px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center space-x-3">
                {user.imageUrl && (
                  <img
                    src={user.imageUrl}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isOpen && query.trim().length >= 2 && !loading && results.length === 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="px-3 py-2 text-sm text-gray-500">
            No users found
          </div>
        </div>
      )}
    </div>
  );
}

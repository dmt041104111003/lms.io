import { useState, useEffect } from 'react';
import authService, { UserResponse } from '@/services/authService';

interface UseAuthReturn {
  user: UserResponse | null;
  isAuthenticated: boolean;
  loading: boolean;
  refresh: () => Promise<void>;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const userData = await authService.getMyInfo();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    user,
    isAuthenticated,
    loading,
    refresh,
  };
};


import { apiRequest } from '@/lib/api';
import type { UserResponse } from '@/services/authService';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const userService = {
  async searchUsers(keyword: string, page = 0, size = 10): Promise<PageResponse<UserResponse>> {
    const params = new URLSearchParams({ keyword, page: String(page), size: String(size) });
    return apiRequest<PageResponse<UserResponse>>(`/api/users?${params.toString()}`, { method: 'GET' });
  },
  async getUserByEmail(email: string): Promise<UserResponse> {
    const params = new URLSearchParams({ email });
    return apiRequest<UserResponse>(`/api/users/by-email?${params.toString()}`, { method: 'GET' });
  },
};

export default userService;

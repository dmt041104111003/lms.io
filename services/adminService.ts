import apiRequest from '@/lib/api';

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email?: string;
  status: string;
  imageUrl?: string;
  dob?: string;
  role?: {
    name?: string;
  };
  loginMethod?: {
    name?: string;
  };
}

export interface RoleResponse {
  name: string;
}

export interface TagResponse {
  id: number;
  name: string;
  slug: string;
  createdAt?: string;
}

export interface TagCreateRequest {
  name: string;
}

export interface UserSearchParams {
  keyword?: string;
  role?: string;
  status?: string;
  page?: number;
  size?: number;
}

export interface UserUpdateRoleRequest {
  role: string;
}

export const adminService = {
  async getUsers(params: UserSearchParams = {}): Promise<PageResponse<UserResponse>> {
    const queryParams = new URLSearchParams();
    if (params.keyword) queryParams.append('keyword', params.keyword);
    if (params.role) queryParams.append('role', params.role);
    if (params.status) queryParams.append('status', params.status);
    if (params.page !== undefined) queryParams.append('page', params.page.toString());
    if (params.size !== undefined) queryParams.append('size', params.size.toString());

    const endpoint = `/api/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return apiRequest<PageResponse<UserResponse>>(endpoint, {
      method: 'GET',
    });
  },

  async getUser(userId: string): Promise<UserResponse> {
    return apiRequest<UserResponse>(`/api/users/${userId}`, {
      method: 'GET',
    });
  },

  async banUser(userId: string): Promise<string> {
    return apiRequest<string>(`/api/users/${userId}/ban`, {
      method: 'PUT',
    });
  },

  async unbanUser(userId: string): Promise<string> {
    return apiRequest<string>(`/api/users/${userId}/unban`, {
      method: 'PUT',
    });
  },

  async deleteUser(userId: string): Promise<string> {
    return apiRequest<string>(`/api/users/${userId}`, {
      method: 'DELETE',
    });
  },

  async updateUserRole(userId: string, role: string): Promise<UserResponse> {
    const request: UserUpdateRoleRequest = { role };
    return apiRequest<UserResponse>(`/api/users/updateRole/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  },

  async getRoles(): Promise<RoleResponse[]> {
    return apiRequest<RoleResponse[]>('/api/roles', {
      method: 'GET',
    });
  },

  async getTags(): Promise<TagResponse[]> {
    return apiRequest<TagResponse[]>('/api/tags', {
      method: 'GET',
    });
  },

  async createTag(name: string): Promise<TagResponse> {
    const request: TagCreateRequest = { name };
    return apiRequest<TagResponse>('/api/tags', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async deleteTag(id: number): Promise<void> {
    return apiRequest<void>(`/api/tags/${id}`, {
      method: 'DELETE',
    });
  },
};

export default adminService;


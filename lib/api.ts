const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://lms-backend-0-0-1.onrender.com';

export interface ApiResponse<T> {
  code: number;
  message?: string;
  result: T;
}

export interface ApiError {
  code: number;
  message: string;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Important for cookies
  };

  try {
    const response = await fetch(url, config);
    let data: ApiResponse<T>;
    
    try {
      data = await response.json();
    } catch {
      if (response.status === 401 || response.status === 403) {
        handleUserLogout();
      }
      throw new Error(`Request failed with status ${response.status}`);
    }

    if (!response.ok) {
      const errorMessage = data.message || `Request failed with status ${response.status}`;
      if (response.status === 401 || response.status === 403 || 
          errorMessage.includes('USER_NOT_EXISTED') || 
          errorMessage.includes('UNAUTHENTICATED')) {
        handleUserLogout();
      }
      throw new Error(errorMessage);
    }

    if (data.code !== 1000) {
      const errorMessage = data.message || 'API error';
      if (errorMessage.includes('USER_NOT_EXISTED') || 
          errorMessage.includes('UNAUTHENTICATED')) {
        handleUserLogout();
      }
      throw new Error(errorMessage);
    }

    return data.result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred');
  }
}

function handleUserLogout() {
  if (typeof window !== 'undefined') {
    const pathname = window.location.pathname;
    const isProtectedPage = pathname.startsWith('/instructor') || 
                           pathname.startsWith('/admin') || 
                           pathname.startsWith('/profile') || 
                           pathname.startsWith('/my-courses');
    
    localStorage.removeItem('access_token');
    if (isProtectedPage && !pathname.includes('/login') && !pathname.includes('/signup')) {
      window.location.href = '/login';
    }
  }
}

export default apiRequest;


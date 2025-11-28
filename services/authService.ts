import apiRequest from '@/lib/api';

export interface LoginRequest {
  email?: string;
  password?: string;
  loginMethod: string;
  address?: string;
  signature?: string;
  key?: string;
  nonce?: string;
}

export interface LoginResponse {
  token: string;
  authenticated: boolean;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  status: string;
  google?: string;
  github?: string;
  imageUrl?: string;
  walletAddress?: string;
  loginMethod?: any;
  role?: { name?: string };
}

export const authService = {
  async login(credentials: { email: string; password: string }): Promise<LoginResponse> {
    const request: LoginRequest = {
      email: credentials.email,
      password: credentials.password,
      loginMethod: 'EMAIL_PASSWORD',
    };
    return apiRequest<LoginResponse>('/api/auth/token', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async signup(userData: { fullName: string; email: string; password: string }): Promise<string> {
    const request: SignupRequest = {
      email: userData.email,
      password: userData.password,
      fullName: userData.fullName,
    };
    try {
      return await apiRequest<string>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify(request),
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error('Signup failed. Please try again.');
    }
  },

  async logout(): Promise<void> {
    await apiRequest('/api/auth/logout', {
      method: 'POST',
    });
    
    // Remove wallet addresses and course data from localStorage on logout
    localStorage.removeItem('wallet_address');
    localStorage.removeItem('connected_wallet_address');
    localStorage.removeItem('connected_wallet_name');
    localStorage.removeItem('mycourse_recent');
  },

  async getMyInfo(): Promise<UserResponse> {
    return apiRequest<UserResponse>('/api/users/my-info', {
      method: 'GET',
    });
  },

  async updateMyName(fullName: string): Promise<UserResponse> {
    return apiRequest<UserResponse>('/api/users/me/name', {
      method: 'PUT',
      body: JSON.stringify({ fullName }),
    });
  },

  async changeMyPassword(params: { currentPassword: string; newPassword: string }): Promise<string> {
    return apiRequest<string>('/api/users/me/password', {
      method: 'PUT',
      body: JSON.stringify({
        currentPassword: params.currentPassword,
        newPassword: params.newPassword,
      }),
    });
  },

  async forgotPassword(email: string): Promise<string> {
    return apiRequest<string>('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async resetPassword(params: { email: string; code: string; newPassword: string }): Promise<string> {
    return apiRequest<string>('/api/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ email: params.email, code: params.code, newPassword: params.newPassword }),
    });
  },

  async generateNonce(address: string): Promise<{ nonce: string }> {
    return apiRequest<{ nonce: string }>('/api/nonce', {
      method: 'POST',
      body: JSON.stringify({ address }),
    });
  },

  async resendVerificationCode(email: string): Promise<string> {
    return apiRequest<string>('/api/auth/resend-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  async verifyEmail(params: { email: string; code: string }): Promise<string> {
    return apiRequest<string>('/api/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ email: params.email, code: params.code }),
    });
  },

  async loginWithWallet(walletData: {
    address: string;
    signature: string;
    key: string;
    nonce: string;
  }): Promise<LoginResponse> {
    const request: LoginRequest = {
      loginMethod: 'WALLET',
      address: walletData.address,
      signature: walletData.signature,
      key: walletData.key,
      nonce: walletData.nonce,
    };
    return apiRequest<LoginResponse>('/api/auth/token', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },
};

export default authService;


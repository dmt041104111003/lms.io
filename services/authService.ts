import apiRequest from '@/lib/api';

export interface LoginRequest {
  username?: string;
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
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  dob?: string; // ISO date string
  loginMethod?: string;
}

export interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  imageUrl?: string;
  dob?: string;
  role?: {
    name?: string;
  };
}

export const authService = {
  async login(credentials: { username: string; password: string }): Promise<LoginResponse> {
    const request: LoginRequest = {
      username: credentials.username,
      password: credentials.password,
      loginMethod: 'USERNAME_PASSWORD',
    };
    return apiRequest<LoginResponse>('/api/auth/token', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  },

  async signup(userData: {
    username: string;
    password: string;
    firstName: string;
    lastName: string;
    email: string;
    dob?: string;
  }): Promise<UserResponse> {
    const request: SignupRequest = {
      username: userData.username,
      password: userData.password,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      dob: userData.dob,
      loginMethod: 'USERNAME_PASSWORD',
    };
    try {
      return await apiRequest<UserResponse>('/api/users', {
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
  },

  async getMyInfo(): Promise<UserResponse> {
    return apiRequest<UserResponse>('/api/users/my-info', {
      method: 'GET',
    });
  },

  async generateNonce(address: string): Promise<{ nonce: string }> {
    return apiRequest<{ nonce: string }>('/api/nonce', {
      method: 'POST',
      body: JSON.stringify({ address }),
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


import axios from 'axios';
import Cookies from 'js-cookie';
import { config } from './config';

const api = axios.create({
  baseURL: config.API_BASE_URL,
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = Cookies.get('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Only redirect to auth on 401 if it's not a login/register request
    if (error.response?.status === 401) {
      const isAuthEndpoint = error.config?.url?.includes('/auth/login') || 
                            error.config?.url?.includes('/auth/register');
      
      if (!isAuthEndpoint) {
        Cookies.remove('token');
        window.location.href = '/auth';
      }
    }
    return Promise.reject(error);
  }
);

export enum Gender {
  MALE = 'male',
  FEMALE = 'female',
  NON_BINARY = 'non-binary',
}

export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  gender?: Gender;
  bio?: string;
  interests?: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  preferences?: {
    ageRange: { min: number; max: number };
    interestedInGender: Gender | Gender[];
  };
  profilePictureUrl?: string;
  isActive?: boolean;
  isProfileComplete?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface SetupProfileRequest {
  age: number;
  gender: Gender;
  bio: string;
  interests: string[];
  latitude: number;
  longitude: number;
  minAge: number;
  maxAge: number;
  interestedInGender: Gender | Gender[];
  profilePictureUrl: string;
}

export interface UpdateProfileRequest {
  age?: number;
  gender?: Gender;
  bio?: string;
  interests?: string[];
  latitude?: number;
  longitude?: number;
  minAge?: number;
  maxAge?: number;
  interestedInGender?: Gender | Gender[];
  profilePictureUrl: string;
}

export enum SwipeAction {
  LIKE = 'like',
  PASS = 'pass',
}

export enum MatchStatus {
  PENDING = 'pending',
  MATCHED = 'matched',
}

export interface SwipeRequest {
  targetUserId: string;
  action: SwipeAction;
}

export interface SwipeResponse {
  message: string;
  isMatch?: boolean;
  match?: {
    id: string;
    userId1: string;
    userId2: string;
    status: MatchStatus;
    matchedAt?: string;
  };
}

export interface MatchUser {
  id: string;
  name: string;
  age: number;
  bio: string;
  profilePictureUrl?: string;
  gender: Gender;
  interests: string[];
  location: {
    latitude: number;
    longitude: number;
  };
  distance?: number;
}

export const authApi = {
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    console.log(response)
    return response.data;
  },

  getProfile: async (): Promise<User> => {
    console.log('Getting user profile, token:', Cookies.get('token'));
    const response = await api.get('/users/me');
    console.log('Get profile response:', response.data);
    return response.data;
  },
};

export const profileApi = {
  setupProfile: async (data: SetupProfileRequest): Promise<{ message: string; user: User }> => {
    console.log('Making setup profile request with data:', data);
    console.log('Token from cookies:', Cookies.get('token'));
    const response = await api.post('/users/profile/setup', data);
    console.log('Setup profile response:', response.data);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<{ message: string; user: User }> => {
    const response = await api.patch('/users/profile', data);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  uploadProfilePhoto: async (file: File): Promise<{ message: string; url: string; user: User }> => {
    const form = new FormData();
    form.append('file', file);
    const response = await api.post('/users/profile/photo', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export const matchesApi = {
  getPotentialMatches: async (limit: number = 10): Promise<MatchUser[]> => {
    const response = await api.get('/matches/cards');
    return response.data;
  },

  swipe: async (data: SwipeRequest): Promise<SwipeResponse> => {
    const response = await api.post('/matches/swipe', data);
    return response.data;
  },

  getMatches: async (): Promise<MatchUser[]> => {
    const response = await api.get('/matches');
    return response.data;
  },

  unmatch: async (targetUserId: string): Promise<{ message: string }> => {
    const response = await api.delete(`/matches/${targetUserId}`);
    return response.data;
  },
};

export const chatApi = {
  getHistory: async (targetUserId: string, limit = 50): Promise<{ messages: any[] }> => {
    const response = await api.get(`/chat/history/${targetUserId}`, { params: { limit } });
    return response.data;
  },
};

export default api;
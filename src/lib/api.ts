import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
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
  photoUrl: string;
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
  photoUrl?: string;
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
};

export default api;
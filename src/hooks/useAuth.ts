'use client';

import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  loginUser,
  registerUser,
  logout,
  setupUserProfile,
  updateUserProfile,
  refreshUserData,
  clearError,
} from '@/store/slices/authSlice';
import { LoginRequest, RegisterRequest, SetupProfileRequest, UpdateProfileRequest } from '@/lib/api';

export function useAuth() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { user, loading, isAuthenticated, error } = useAppSelector((state) => state.auth);

  const login = async (data: LoginRequest) => {
    try {
      const result = await dispatch(loginUser(data)).unwrap();
      // Check if profile is complete before redirecting
      if (result.isProfileComplete) {
        router.push('/discover');
      } else {
        router.push('/setup');
      }
      return result;
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterRequest) => {
    try {
      const result = await dispatch(registerUser(data)).unwrap();
      // New users always need to complete profile setup
      router.push('/setup');
      return result;
    } catch (error) {
      throw error;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
  };

  const setupProfile = async (data: SetupProfileRequest) => {
    try {
      const result = await dispatch(setupUserProfile(data)).unwrap();
      router.push('/discover');
      return result;
    } catch (error) {
      throw error;
    }
  };

  const updateProfile = async (data: UpdateProfileRequest) => {
    try {
      const result = await dispatch(updateUserProfile(data)).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const refreshUser = async () => {
    try {
      const result = await dispatch(refreshUserData()).unwrap();
      return result;
    } catch (error) {
      throw error;
    }
  };

  const clearAuthError = () => {
    dispatch(clearError());
  };

  return {
    user,
    loading,
    login,
    register,
    logout: handleLogout,
    setupProfile,
    updateProfile,
    refreshUser,
    isAuthenticated,
    error,
    clearError: clearAuthError,
  };
}
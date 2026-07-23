import apiClient from '@/lib/api-client'
import { ApiResponse, User } from '@/types'

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

export interface AuthResponse {
  user: User
  tokens?: {
    accessToken: string
    refreshToken: string
  }
  token?: string
  refreshToken?: string
}

export interface ForgotPasswordData {
  email: string
}

export interface ResetPasswordData {
  token: string
  password: string
  confirmPassword: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface VerifyOTPData {
  email: string
  otp: string
}

const authService = {
  // Login
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/login',
      credentials
    )
    return response.data
  },

  // Register
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/register',
      data
    )
    return response.data
  },

  // Logout
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout')
  },

  // Forgot Password
  forgotPassword: async (data: ForgotPasswordData): Promise<void> => {
    await apiClient.post('/auth/forgot-password', data)
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordData): Promise<void> => {
    await apiClient.post('/auth/reset-password', data)
  },

  // Change Password
  changePassword: async (data: ChangePasswordData): Promise<void> => {
    await apiClient.post('/auth/change-password', data)
  },

  // Verify OTP
  verifyOTP: async (data: VerifyOTPData): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      '/auth/verify-otp',
      data
    )
    return response.data
  },

  // Resend OTP
  resendOTP: async (email: string): Promise<void> => {
    await apiClient.post('/auth/resend-otp', { email })
  },

  // Get Current User
  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/me')
    return response.data
  },

  // Refresh Token
  refreshToken: async (refreshToken: string): Promise<{ token: string }> => {
    const response = await apiClient.post<ApiResponse<{ token: string }>>(
      '/auth/refresh',
      { refreshToken }
    )
    return response.data
  },

  // Unlock Screen
  unlockScreen: async (password: string): Promise<void> => {
    await apiClient.post('/auth/unlock', { password })
  },
}

export default authService

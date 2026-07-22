import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { useAuthStore } from '@/store/auth-store'
import authService, {
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  ChangePasswordData,
  VerifyOTPData,
} from '../services/auth-service'
import { queryKeys } from '@/lib/query-client'
import { toast } from 'sonner'

export function useAuth() {
  const { user, isAuthenticated, setUser, setTokens, logout: logoutStore } = useAuthStore()
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setTokens(data.token, data.refreshToken)
      setUser(data.user)
      queryClient.invalidateQueries({ queryKey: queryKeys.auth.all })
      toast.success('Login successful!')
      navigate('/dashboard')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Login failed')
    },
  })

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      setTokens(data.token, data.refreshToken)
      setUser(data.user)
      toast.success('Registration successful!')
      navigate('/dashboard')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Registration failed')
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      logoutStore()
      queryClient.clear()
      toast.success('Logged out successfully')
      navigate('/login')
    },
    onError: () => {
      // Force logout even if API call fails
      logoutStore()
      queryClient.clear()
      navigate('/login')
    },
  })

  // Forgot password mutation
  const forgotPasswordMutation = useMutation({
    mutationFn: authService.forgotPassword,
    onSuccess: () => {
      toast.success('Password reset link sent to your email')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to send reset link')
    },
  })

  // Reset password mutation
  const resetPasswordMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: () => {
      toast.success('Password reset successful!')
      navigate('/login')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to reset password')
    },
  })

  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: authService.changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to change password')
    },
  })

  // Verify OTP mutation
  const verifyOTPMutation = useMutation({
    mutationFn: authService.verifyOTP,
    onSuccess: (data) => {
      setTokens(data.token, data.refreshToken)
      setUser(data.user)
      toast.success('OTP verified successfully!')
      navigate('/dashboard')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Invalid OTP')
    },
  })

  // Resend OTP mutation
  const resendOTPMutation = useMutation({
    mutationFn: authService.resendOTP,
    onSuccess: () => {
      toast.success('OTP sent successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to resend OTP')
    },
  })

  // Get current user query
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: queryKeys.auth.user(),
    queryFn: authService.getCurrentUser,
    enabled: isAuthenticated,
    retry: false,
  })

  return {
    user: currentUser || user,
    isAuthenticated,
    isLoadingUser,
    login: loginMutation.mutate,
    loginAsync: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    registerAsync: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutate,
    forgotPasswordAsync: forgotPasswordMutation.mutateAsync,
    isSendingResetLink: forgotPasswordMutation.isPending,
    resetPassword: resetPasswordMutation.mutate,
    resetPasswordAsync: resetPasswordMutation.mutateAsync,
    isResettingPassword: resetPasswordMutation.isPending,
    changePassword: changePasswordMutation.mutate,
    changePasswordAsync: changePasswordMutation.mutateAsync,
    isChangingPassword: changePasswordMutation.isPending,
    verifyOTP: verifyOTPMutation.mutate,
    verifyOTPAsync: verifyOTPMutation.mutateAsync,
    isVerifyingOTP: verifyOTPMutation.isPending,
    resendOTP: resendOTPMutation.mutate,
    isResendingOTP: resendOTPMutation.isPending,
  }
}

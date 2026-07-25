import apiClient from '@/lib/api-client'
import { ApiResponse } from '@/types'

export interface TwoFactorSecretResponse {
  secret: string
  otpauthUrl: string
}

export interface SessionDevice {
  id: string
  device: string
  browser: string
  ipAddress: string
  isCurrent: boolean
  lastActive: string
  createdAt: string
}

export interface LoginLog {
  id: string
  timestamp: string
  ipAddress: string
  device: string
  browser: string
  status: 'SUCCESS' | 'FAILED'
}

export interface PasswordPolicy {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  maxAgeDays: number
}

export interface ApiToken {
  id: string
  name: string
  maskedKey: string
  scopes: string[]
  expiresAt: string | null
  lastUsedAt: string | null
  createdAt: string
  fullKey?: string
}

export const securityApi = {
  // 2FA
  get2FAStatus: async (): Promise<ApiResponse<{ isEnabled: boolean }>> => {
    const response = await apiClient.get('/security/2fa/status')
    return response as any
  },

  generate2FASecret: async (): Promise<ApiResponse<TwoFactorSecretResponse>> => {
    const response = await apiClient.post('/security/2fa/generate')
    return response as any
  },

  enable2FA: async (code: string): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await apiClient.post('/security/2fa/enable', { code })
    return response as any
  },

  disable2FA: async (): Promise<ApiResponse<{ success: boolean; message: string }>> => {
    const response = await apiClient.post('/security/2fa/disable')
    return response as any
  },

  // Sessions
  getSessions: async (): Promise<ApiResponse<SessionDevice[]>> => {
    const response = await apiClient.get('/security/sessions')
    return response as any
  },

  revokeSession: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.delete(`/security/sessions/${id}`)
    return response as any
  },

  revokeOtherSessions: async (): Promise<ApiResponse<{ revokedCount: number }>> => {
    const response = await apiClient.delete('/security/sessions/other')
    return response as any
  },

  // Login History
  getLoginHistory: async (): Promise<ApiResponse<LoginLog[]>> => {
    const response = await apiClient.get('/security/login-history')
    return response as any
  },

  // Password Policy
  getPasswordPolicy: async (): Promise<ApiResponse<PasswordPolicy>> => {
    const response = await apiClient.get('/security/password-policy')
    return response as any
  },

  updatePasswordPolicy: async (data: Partial<PasswordPolicy>): Promise<ApiResponse<PasswordPolicy>> => {
    const response = await apiClient.put('/security/password-policy', data)
    return response as any
  },

  // API Tokens
  getApiTokens: async (): Promise<ApiResponse<ApiToken[]>> => {
    const response = await apiClient.get('/security/tokens')
    return response as any
  },

  createApiToken: async (
    name: string,
    scopes: string[] = ['read']
  ): Promise<ApiResponse<{ token: ApiToken }>> => {
    const response = await apiClient.post('/security/tokens', { name, scopes })
    return response as any
  },

  revokeApiToken: async (id: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await apiClient.delete(`/security/tokens/${id}`)
    return response as any
  },
}

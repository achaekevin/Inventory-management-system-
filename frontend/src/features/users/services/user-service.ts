import apiClient from '@/lib/api-client'
import { ApiResponse, PaginatedResponse, User } from '@/types'

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: string
  phone?: string
  isActive: boolean
}

export interface UpdateUserData extends Partial<CreateUserData> {
  id: string
}

const userService = {
  getUsers: async (params?: {
    page?: number
    pageSize?: number
    search?: string
  }): Promise<PaginatedResponse<User>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<User>>>(
      '/users',
      { params }
    )
    return response.data
  },

  getUser: async (id: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  },

  createUser: async (data: CreateUserData): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>('/users', data)
    return response.data
  },

  updateUser: async (id: string, data: UpdateUserData): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data)
    return response.data
  },

  deleteUser: async (id: string): Promise<void> => {
    await apiClient.delete(`/users/${id}`)
  },
}

export default userService

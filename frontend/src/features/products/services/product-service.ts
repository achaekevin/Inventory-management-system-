import apiClient from '@/lib/api-client'
import { ApiResponse, PaginatedResponse, Product } from '@/types'

export interface CreateProductData {
  name: string
  sku: string
  barcode?: string
  description?: string
  categoryId: string
  brandId?: string
  unitId: string
  price: number
  cost: number
  minStock: number
  reorderLevel: number
  taxable: boolean
  trackInventory: boolean
  images?: File[]
}

export interface UpdateProductData extends Partial<CreateProductData> {
  id: string
}

const productService = {
  getProducts: async (params?: {
    page?: number
    pageSize?: number
    search?: string
    categoryId?: string
    brandId?: string
  }): Promise<PaginatedResponse<Product>> => {
    const response = await apiClient.get<ApiResponse<PaginatedResponse<Product>>>(
      '/products',
      { params }
    )
    return response.data
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await apiClient.get<ApiResponse<Product>>(`/products/${id}`)
    return response.data
  },

  createProduct: async (data: CreateProductData): Promise<Product> => {
    const response = await apiClient.post<ApiResponse<Product>>('/products', data)
    return response.data
  },

  updateProduct: async (id: string, data: UpdateProductData): Promise<Product> => {
    const response = await apiClient.put<ApiResponse<Product>>(`/products/${id}`, data)
    return response.data
  },

  deleteProduct: async (id: string): Promise<void> => {
    await apiClient.delete(`/products/${id}`)
  },

  uploadProductImage: async (productId: string, file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('image', file)
    const response = await apiClient.post<ApiResponse<{ url: string }>>(
      `/products/${productId}/images`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    )
    return response.data.url
  },
}

export default productService

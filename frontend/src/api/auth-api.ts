import { apiClient } from '@/lib/axios'
import type { LoginPayload, LoginResponse } from '@/types/auth'

export async function login(payload: LoginPayload): Promise<LoginResponse> {
  const { data } = await apiClient.post<LoginResponse>('/auth/login', payload)
  return data
}

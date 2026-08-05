import { apiClient } from '@/lib/axios'
import type {
  CreateRolePayload,
  Role,
  RoleSearchParams,
  UpdateRolePayload,
  UpdateRoleProgramsPayload,
} from '@/types/role'

export async function fetchRoles(params: RoleSearchParams): Promise<Role[]> {
  const { data } = await apiClient.get<Role[]>('/roles', { params })
  return data
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  const { data } = await apiClient.post<Role>('/roles', payload)
  return data
}

export async function updateRole(payload: UpdateRolePayload): Promise<Role> {
  const { id, ...body } = payload
  const { data } = await apiClient.put<Role>(`/roles/${id}`, body)
  return data
}

export async function deleteRole(id: string): Promise<void> {
  await apiClient.delete(`/roles/${id}`)
}

export async function updateRolePrograms(payload: UpdateRoleProgramsPayload): Promise<Role> {
  const { data } = await apiClient.put<Role>(`/roles/${payload.id}/programs`, payload)
  return data
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRole, deleteRole, fetchRoles, updateRole, updateRolePrograms } from '@/api/role-api'
import type { RoleSearchParams } from '@/types/role'

export const roleKeys = {
  all: ['roles'] as const,
  list: (params: RoleSearchParams) => [...roleKeys.all, 'list', params] as const,
}

export function useRolesQuery(params: RoleSearchParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => fetchRoles(params),
    placeholderData: (prev) => prev,
    enabled: options?.enabled,
  })
}

export function useCreateRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

export function useUpdateRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

export function useDeleteRoleMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

export function useUpdateRoleProgramsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRolePrograms,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

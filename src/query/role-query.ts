import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createRole, fetchRoles, updateRoleMenus } from '@/api/role-api'
import type { RoleSearchParams } from '@/types/role'

export const roleKeys = {
  all: ['roles'] as const,
  list: (params: RoleSearchParams) => [...roleKeys.all, 'list', params] as const,
}

export function useRolesQuery(params: RoleSearchParams) {
  return useQuery({
    queryKey: roleKeys.list(params),
    queryFn: () => fetchRoles(params),
    placeholderData: (prev) => prev,
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

export function useUpdateRoleMenusMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateRoleMenus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

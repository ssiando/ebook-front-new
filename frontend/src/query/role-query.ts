import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteRoles, fetchRoles, saveRoles, updateRolePrograms } from '@/api/role-api'
import type { Role, RoleSearchParams } from '@/types/role'

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

export function useSaveRolesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (roles: Role[]) => saveRoles(roles),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: roleKeys.all })
    },
  })
}

export function useDeleteRolesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: string[]) => deleteRoles(ids),
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

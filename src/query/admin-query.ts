import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAdmin, fetchAdmins, updateAdminRoles } from '@/api/admin-api'
import type { AdminSearchParams } from '@/types/admin'

export const adminKeys = {
  all: ['admins'] as const,
  list: (params: AdminSearchParams) => [...adminKeys.all, 'list', params] as const,
}

export function useAdminsQuery(params: AdminSearchParams) {
  return useQuery({
    queryKey: adminKeys.list(params),
    queryFn: () => fetchAdmins(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateAdminMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}

export function useUpdateAdminRolesMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAdminRoles,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}

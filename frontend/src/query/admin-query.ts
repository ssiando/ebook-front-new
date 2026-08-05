import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAdmin,
  deleteAdmin,
  fetchAdmins,
  updateAdmin,
  updateAdminRoles,
} from '@/api/admin-api'
import type { AdminSearchParams } from '@/types/admin'

export const adminKeys = {
  all: ['admins'] as const,
  list: (params: AdminSearchParams, revision?: number) =>
    [...adminKeys.all, 'list', params, revision] as const,
}

export function useAdminsQuery(params: AdminSearchParams, revision?: number) {
  return useQuery({
    queryKey: adminKeys.list(params, revision),
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

export function useUpdateAdminMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateAdmin,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.all })
    },
  })
}

export function useDeleteAdminMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAdmin,
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

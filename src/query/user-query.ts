import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createUser, fetchUsers } from '@/api/user-api'
import type { UserSearchParams } from '@/types/user'

export const userKeys = {
  all: ['users'] as const,
  list: (params: UserSearchParams) => [...userKeys.all, 'list', params] as const,
}

export function useUsersQuery(params: UserSearchParams) {
  return useQuery({
    queryKey: userKeys.list(params),
    queryFn: () => fetchUsers(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateUserMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all })
    },
  })
}

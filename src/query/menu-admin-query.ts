import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createMenu, fetchMenus } from '@/api/menu-admin-api'
import type { MenuSearchParams } from '@/types/menuAdmin'

export const menuAdminKeys = {
  all: ['menus'] as const,
  list: (params: MenuSearchParams) => [...menuAdminKeys.all, 'list', params] as const,
}

export function useMenusQuery(params: MenuSearchParams) {
  return useQuery({
    queryKey: menuAdminKeys.list(params),
    queryFn: () => fetchMenus(params),
    placeholderData: (prev) => prev,
  })
}

export function useCreateMenuMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuAdminKeys.all })
    },
  })
}

import { useMutation } from '@tanstack/react-query'
import { login } from '@/api/auth-api'
import { useAuthStore } from '@/store/useAuthStore'
import { useRolesQuery } from '@/query/role-query'
import type { Role } from '@/types/role'

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (admin) => {
      useAuthStore.getState().login(admin)
    },
  })
}

/** 로그인한 관리자에게 부여된 역할 엔티티 목록 (메뉴 권한 판단에 사용). */
export function useCurrentAdminRoles(): Role[] {
  const currentAdmin = useAuthStore((s) => s.currentAdmin)
  const rolesQuery = useRolesQuery({ system: 'ALL', keyword: '', page: 1, pageSize: 200 })
  const roles = rolesQuery.data?.items ?? []
  return roles.filter((role) => currentAdmin?.roleIds.includes(role.id))
}

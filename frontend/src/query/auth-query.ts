import { useMutation } from '@tanstack/react-query'
import { login } from '@/api/auth-api'
import { useAuthStore } from '@/store/useAuthStore'
import type { CurrentAdmin, LoginResponse } from '@/types/auth'

function toCurrentAdmin(response: LoginResponse): CurrentAdmin {
  return {
    id: response.adminPk,
    adminName: response.adminName,
    email: response.email,
    roles: response.roles,
  }
}

export function useLoginMutation() {
  return useMutation({
    mutationFn: login,
    onSuccess: (response) => {
      localStorage.setItem('accessToken', response.accessToken)
      useAuthStore.getState().login(toCurrentAdmin(response))
    },
  })
}

/** 로그인한 관리자에게 부여된 역할명 목록 (메뉴 권한 판단에 사용). */
export function useCurrentAdminRoles(): string[] {
  return useAuthStore((s) => s.currentAdmin?.roles) ?? []
}

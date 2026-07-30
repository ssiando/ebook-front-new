import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

interface AuthGuardProps {
  children: ReactNode
}

/** 로그인하지 않은 상태로 보호된 화면에 접근하면 로그인 화면으로 보낸다. */
export function AuthGuard({ children }: AuthGuardProps) {
  const currentAdmin = useAuthStore((s) => s.currentAdmin)

  if (!currentAdmin) return <Navigate to="/login" replace />

  return <>{children}</>
}

import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'

interface GuestGuardProps {
  children: ReactNode
}

/** 이미 로그인한 상태로 로그인 화면에 접근하면 홈으로 보낸다. */
export function GuestGuard({ children }: GuestGuardProps) {
  const currentAdmin = useAuthStore((s) => s.currentAdmin)

  if (currentAdmin) return <Navigate to="/" replace />

  return <>{children}</>
}

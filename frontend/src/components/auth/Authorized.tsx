import type { ReactNode } from 'react'
import { useLocation } from 'react-router-dom'
import { ShieldAlert } from 'lucide-react'
import menuData from '@/data/menu.json'
import type { MenuItem } from '@/types/menu'
import { useCurrentAdminRoles } from '@/query/auth-query'
import { findMenuGroupIdForPath, hasMenuGroupAccess } from '@/utils/menuPermission'

interface AuthorizedProps {
  children: ReactNode
}

/** 현재 로그인한 관리자가 이 경로가 속한 메뉴 그룹에 접근 권한이 없으면 화면 내용을 가린다. */
export function Authorized({ children }: AuthorizedProps) {
  const location = useLocation()
  const roles = useCurrentAdminRoles()
  const groupId = findMenuGroupIdForPath(menuData as MenuItem[], location.pathname)
  const allowed = !groupId || hasMenuGroupAccess(groupId, roles)

  if (!allowed) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-2 rounded border border-gray-200 text-gray-400">
        <ShieldAlert size={32} />
        <p className="text-sm">이 화면에 접근할 권한이 없습니다.</p>
      </div>
    )
  }

  return <>{children}</>
}

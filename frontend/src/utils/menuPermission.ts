import type { MenuItem } from '@/types/menu'

// 최상위 메뉴 그룹 id별로 접근을 허용할 역할명(roleName) 집합. 등록되지 않은 그룹은 제한 없음(대시보드/홈 등).
const MENU_GROUP_ROLE_NAMES: Record<string, string[]> = {
  admin: ['ADMIN', 'SUPER_ADMIN', 'WORKSPACE_ADMIN'],
  system: ['SUPER_ADMIN', 'WORKSPACE_ADMIN'],
}

export function hasMenuGroupAccess(groupId: string, roleNames: string[]): boolean {
  // SUPER_ADMIN은 그룹별 허용 목록과 무관하게 항상 전체 메뉴에 접근할 수 있다.
  if (roleNames.includes('SUPER_ADMIN')) return true

  const allowedRoleNames = MENU_GROUP_ROLE_NAMES[groupId]
  if (!allowedRoleNames) return true
  return roleNames.some((roleName) => allowedRoleNames.includes(roleName))
}

/** path가 속한 최상위 메뉴 그룹의 id를 찾는다 (없으면 undefined). */
export function findMenuGroupIdForPath(items: MenuItem[], path: string): string | undefined {
  for (const item of items) {
    if (item.path === path) return item.id
    if (item.children?.some((child) => child.path === path)) return item.id
  }
  return undefined
}

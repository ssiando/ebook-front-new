import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import menuData from '@/data/menu.json'
import type { MenuItem } from '@/types/menu'
import type {
  CreateRolePayload,
  Role,
  RoleListResponse,
  RoleSearchParams,
  UpdateRoleMenusPayload,
} from '@/types/role'

// NOTE: 백엔드 연동 전까지 화면 확인용 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
function collectMenuIds(items: MenuItem[]): string[] {
  return items.flatMap((item) => [item.id, ...(item.children ? collectMenuIds(item.children) : [])])
}

const ALL_MENU_IDS = collectMenuIds(menuData as MenuItem[])

const MOCK_ROLES: Role[] = [
  {
    id: '1',
    roleName: '관리자',
    description: '전체 메뉴 접근 권한',
    menuIds: [...ALL_MENU_IDS],
    useYn: true,
    registrant: 'vfx',
    updatedAt: '2026-07-20',
  },
  {
    id: '2',
    roleName: '매니저',
    description: '기준정보 및 사용자 관리 권한',
    menuIds: [
      'dashboard',
      'home',
      'user',
      'userManagement',
      'master',
      'vendor',
      'vendorList',
      'vendorUser',
      'distributor',
      'producer',
      'program',
      'license',
    ],
    useYn: true,
    registrant: 'vfx',
    updatedAt: '2026-07-18',
  },
  {
    id: '3',
    roleName: '일반',
    description: '조회 전용 권한',
    menuIds: ['dashboard', 'home', 'user', 'userManagement'],
    useYn: true,
    registrant: 'vfx',
    updatedAt: '2026-07-10',
  },
]

export async function fetchRoles(params: RoleSearchParams): Promise<RoleListResponse> {
  if (import.meta.env.DEV) {
    const filtered = params.keyword
      ? MOCK_ROLES.filter((role) => role.roleName.includes(params.keyword))
      : MOCK_ROLES
    return delay({ items: [...filtered], totalCount: filtered.length })
  }

  const { data } = await apiClient.get<RoleListResponse>('/roles', { params })
  return data
}

export async function createRole(payload: CreateRolePayload): Promise<Role> {
  if (import.meta.env.DEV) {
    const created: Role = {
      id: `role-${Date.now()}`,
      roleName: payload.roleName,
      description: payload.description,
      menuIds: [],
      useYn: true,
      registrant: 'me',
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    MOCK_ROLES.unshift(created)
    return delay(created)
  }

  const { data } = await apiClient.post<Role>('/roles', payload)
  return data
}

export async function updateRoleMenus(payload: UpdateRoleMenusPayload): Promise<Role> {
  if (import.meta.env.DEV) {
    const index = MOCK_ROLES.findIndex((r) => r.id === payload.id)
    if (index === -1) throw new Error('Role not found')
    // 기존 객체를 그대로 mutate하면 Ag-Grid가 참조 동일성으로 변경을 감지하지 못해
    // 그리드가 갱신되지 않는다 — 반드시 새 객체로 교체한다.
    const updated: Role = {
      ...MOCK_ROLES[index],
      menuIds: payload.menuIds,
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    MOCK_ROLES[index] = updated
    return delay(updated)
  }

  const { data } = await apiClient.put<Role>(`/roles/${payload.id}/menus`, payload)
  return data
}

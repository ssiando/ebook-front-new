import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import type {
  Role,
  RoleListResponse,
  RoleSearchParams,
  UpdateRoleProgramsPayload,
} from '@/types/role'

// NOTE: 백엔드 연동 전까지 화면 확인용 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
const DEFAULT_PROGRAM_IDS = ['page-home', 'page-user']
const ADMIN_PROGRAM_IDS = ['page-home', 'page-user', 'page-common', 'page-master', 'page-workspace']
const SUPER_ADMIN_PROGRAM_IDS = ['page-project-mgmt', 'page-process-mgmt', 'page-vfx-budget']

const MOCK_ROLES: Role[] = [
  {
    id: 'role-1',
    roleName: 'VIEWER',
    description: '읽기 전용 기본 역할',
    system: 'DESK',
    memberCount: 1,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-06-30 14:37:56',
  },
  {
    id: 'role-2',
    roleName: 'MEMBER',
    description: '일반 사용자 역할',
    system: 'VFX',
    memberCount: 4,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-3',
    roleName: 'SUPER_ADMIN',
    description: '워크스페이스 관리자 역할',
    system: 'VFX',
    memberCount: 3,
    programIds: SUPER_ADMIN_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-4',
    roleName: 'WORKSPACE_ADMIN',
    description: '워크스페이스 관리자 역할',
    system: 'VFX',
    memberCount: 1,
    programIds: ADMIN_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-06-08 19:29:03',
  },
  {
    id: 'role-5',
    roleName: 'VIEWER',
    description: '읽기 전용 기본 역할',
    system: 'VFX',
    memberCount: 1,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-6',
    roleName: 'VIEWER',
    description: '읽기 전용 기본 역할',
    system: 'GENX',
    memberCount: 1,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-7',
    roleName: 'MEMBER',
    description: '일반 사용자 역할',
    system: 'GENX',
    memberCount: 2,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-8',
    roleName: 'ADMIN',
    description: '시스템 관리자 역할',
    system: 'GENX',
    memberCount: 7,
    programIds: ADMIN_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-9',
    roleName: 'VIEWER',
    description: '읽기 전용 기본 역할',
    system: '4DX',
    memberCount: 2,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-10',
    roleName: 'MEMBER',
    description: '일반 사용자 역할',
    system: '4DX',
    memberCount: 2,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-11',
    roleName: 'ADMIN',
    description: '시스템 관리자 역할',
    system: '4DX',
    memberCount: 4,
    programIds: ADMIN_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-12',
    roleName: 'VIEWER',
    description: '읽기 전용 기본 역할',
    system: 'ASSET',
    memberCount: 1,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-13',
    roleName: 'MEMBER',
    description: '일반 사용자 역할',
    system: 'ASSET',
    memberCount: 0,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-14',
    roleName: 'ADMIN',
    description: '시스템 관리자 역할',
    system: 'ASSET',
    memberCount: 4,
    programIds: ADMIN_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
  {
    id: 'role-15',
    roleName: 'MEMBER',
    description: '일반 사용자 역할',
    system: 'DESK',
    memberCount: 0,
    programIds: DEFAULT_PROGRAM_IDS,
    registrant: 'vfx',
    createdAt: '2026-05-08 14:41:11',
    updatedAt: '2026-05-08 14:41:11',
  },
]

function now(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export async function fetchRoles(params: RoleSearchParams): Promise<RoleListResponse> {
  if (import.meta.env.DEV) {
    const filtered = MOCK_ROLES.filter((role) => {
      const matchesSystem = params.system === 'ALL' ? true : role.system === params.system
      const matchesKeyword = params.keyword
        ? role.roleName.includes(params.keyword) || role.description.includes(params.keyword)
        : true
      return matchesSystem && matchesKeyword
    })
    const start = (params.page - 1) * params.pageSize
    const items = filtered.slice(start, start + params.pageSize)
    return delay({ items, totalCount: filtered.length })
  }

  const { data } = await apiClient.get<RoleListResponse>('/roles', { params })
  return data
}

export async function saveRoles(roles: Role[]): Promise<RoleListResponse> {
  if (import.meta.env.DEV) {
    const saved = roles.map((role) =>
      role.id.startsWith('new-')
        ? {
            ...role,
            id: `role-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            createdAt: now(),
            updatedAt: now(),
          }
        : { ...role, updatedAt: now() },
    )
    MOCK_ROLES.splice(0, MOCK_ROLES.length, ...saved)
    return delay({ items: [...MOCK_ROLES], totalCount: MOCK_ROLES.length })
  }

  const { data } = await apiClient.put<RoleListResponse>('/roles', { roles })
  return data
}

export async function deleteRoles(ids: string[]): Promise<void> {
  if (import.meta.env.DEV) {
    const remaining = MOCK_ROLES.filter((role) => !ids.includes(role.id))
    MOCK_ROLES.splice(0, MOCK_ROLES.length, ...remaining)
    await delay(undefined)
    return
  }

  await apiClient.delete('/roles', { data: { ids } })
}

export async function updateRolePrograms(payload: UpdateRoleProgramsPayload): Promise<Role> {
  if (import.meta.env.DEV) {
    const index = MOCK_ROLES.findIndex((role) => role.id === payload.id)
    if (index === -1) throw new Error('Role not found')
    // 기존 객체를 mutate하면 Ag-Grid가 참조 동일성으로 변경 감지를 못한다 — 새 객체로 교체.
    const updated: Role = { ...MOCK_ROLES[index], programIds: payload.programIds, updatedAt: now() }
    MOCK_ROLES[index] = updated
    return delay(updated)
  }

  const { data } = await apiClient.put<Role>(`/roles/${payload.id}/programs`, payload)
  return data
}

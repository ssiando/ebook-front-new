import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import {
  ADMIN_DEPARTMENTS,
  type Admin,
  type AdminListResponse,
  type AdminSearchParams,
  type CreateAdminPayload,
  type UpdateAdminRolesPayload,
} from '@/types/admin'

// NOTE: 백엔드 연동 전까지 화면 확인용 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
// roleIds는 role-api.ts의 MOCK_ROLES id를 참조합니다 (관리자 한 명이 여러 역할을 가질 수 있음).
// status 값은 common-code-api.ts의 ADMIN_STATUS 그룹 코드(ACTIVE/DORMANT/INACTIVE/NEW)를 그대로 참조합니다.
const ROLE_ID_POOL = ['role-2', 'role-3', 'role-4', 'role-8', 'role-11', 'role-14']
const STATUS_POOL = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'DORMANT', 'INACTIVE']

const MOCK_ADMINS: Admin[] = Array.from({ length: 23 }, (_, i) => {
  const idx = 23 - i
  return {
    id: String(idx),
    adminId: `admin${String(idx).padStart(3, '0')}`,
    adminName: `관리자 ${idx}`,
    email: `admin${String(idx).padStart(3, '0')}@cj.net`,
    department: ADMIN_DEPARTMENTS[idx % ADMIN_DEPARTMENTS.length],
    // idx가 6의 배수인 계정은 일반 MEMBER 역할만 가져 관리자 메뉴 접근 권한 데모용 대조군으로 둔다.
    roleIds:
      idx % 6 === 0
        ? ['role-2']
        : idx % 3 === 0
          ? [ROLE_ID_POOL[idx % ROLE_ID_POOL.length], ROLE_ID_POOL[(idx + 1) % ROLE_ID_POOL.length]]
          : [ROLE_ID_POOL[idx % ROLE_ID_POOL.length]],
    status: STATUS_POOL[idx % STATUS_POOL.length],
    registrant: 'vfx',
    updatedAt: `2026-07-${String((idx % 28) + 1).padStart(2, '0')}`,
  }
})

function now(): string {
  return new Date().toISOString().slice(0, 19).replace('T', ' ')
}

export async function fetchAdmins(params: AdminSearchParams): Promise<AdminListResponse> {
  if (import.meta.env.DEV) {
    const filtered = MOCK_ADMINS.filter((admin) => {
      const matchesKeyword = params.keyword
        ? admin.adminName.includes(params.keyword) ||
          admin.adminId.includes(params.keyword) ||
          admin.email.includes(params.keyword)
        : true
      const matchesDate =
        !params.updatedFrom || !params.updatedTo
          ? true
          : admin.updatedAt >= params.updatedFrom && admin.updatedAt <= params.updatedTo
      const matchesDepartment =
        !params.department || params.department === 'ALL'
          ? true
          : admin.department === params.department
      const matchesStatus =
        !params.status || params.status === 'ALL' ? true : admin.status === params.status
      return matchesKeyword && matchesDate && matchesDepartment && matchesStatus
    })
    const start = (params.page - 1) * params.pageSize
    const items = filtered.slice(start, start + params.pageSize)
    return delay({ items, totalCount: filtered.length })
  }

  const { data } = await apiClient.get<AdminListResponse>('/admins', { params })
  return data
}

export async function createAdmin(payload: CreateAdminPayload): Promise<Admin> {
  if (import.meta.env.DEV) {
    const created: Admin = {
      id: String(Date.now()),
      ...payload,
      status: 'NEW',
      registrant: 'me',
      updatedAt: new Date().toISOString().slice(0, 10),
    }
    MOCK_ADMINS.unshift(created)
    return delay(created)
  }

  const { data } = await apiClient.post<Admin>('/admins', payload)
  return data
}

export async function findAdminByAccount(account: string): Promise<Admin | undefined> {
  if (import.meta.env.DEV) {
    return delay(MOCK_ADMINS.find((admin) => admin.adminId === account || admin.email === account))
  }

  const { data } = await apiClient.get<Admin | undefined>('/admins/lookup', { params: { account } })
  return data
}

export async function updateAdminRoles(payload: UpdateAdminRolesPayload): Promise<Admin> {
  if (import.meta.env.DEV) {
    const index = MOCK_ADMINS.findIndex((admin) => admin.id === payload.id)
    if (index === -1) throw new Error('Admin not found')
    // 기존 객체를 mutate하면 Ag-Grid가 참조 동일성으로 변경 감지를 못한다 — 새 객체로 교체.
    const updated: Admin = { ...MOCK_ADMINS[index], roleIds: payload.roleIds, updatedAt: now() }
    MOCK_ADMINS[index] = updated
    return delay(updated)
  }

  const { data } = await apiClient.put<Admin>(`/admins/${payload.id}/roles`, payload)
  return data
}

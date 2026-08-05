import dayjs from 'dayjs'
import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import {
  ADMIN_DEPARTMENTS,
  type Admin,
  type AdminSearchParams,
  type CreateAdminPayload,
  type UpdateAdminPayload,
  type UpdateAdminRolesPayload,
} from '@/types/admin'

// NOTE: 백엔드 연동 전까지 화면 확인용 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
// roleIds는 role-api.ts의 MOCK_ROLES id를 참조합니다 (관리자 한 명이 여러 역할을 가질 수 있음).
// status 값은 common-code-api.ts의 ADMIN_STATUS 그룹 코드(ACTIVE/DORMANT/INACTIVE/NEW)를 그대로 참조합니다.
const ROLE_ID_POOL = ['role-2', 'role-3', 'role-4', 'role-8', 'role-11', 'role-14']
const STATUS_POOL = ['ACTIVE', 'ACTIVE', 'ACTIVE', 'DORMANT', 'INACTIVE']
const GROUP_POOL = ['디즈니', '마블', '픽사', '내셔널지오그래픽']

const MOCK_ADMINS: Admin[] = Array.from({ length: 23 }, (_, i) => {
  const idx = 23 - i
  // idx가 3의 배수인 계정만 워크스페이스 관리자 권한을 가진다 (그림의 "워크스페이스 관리자" 체크와 동일한 의미).
  const isWorkspaceAdmin = idx % 3 === 0
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
    workspaceAdmin: isWorkspaceAdmin,
    groups: idx % 4 === 0 ? [] : [GROUP_POOL[idx % GROUP_POOL.length]],
    serviceExpiresAt:
      idx % 5 === 0 ? `2026-${String((idx % 12) + 1).padStart(2, '0')}-28` : undefined,
    lastLoginAt:
      idx % 7 === 0
        ? undefined
        : `2026-08-${String((idx % 4) + 1).padStart(2, '0')} 1${idx % 9}:00:00`,
    status: STATUS_POOL[idx % STATUS_POOL.length],
    registrant: 'vfx',
    updatedAt: `2026-07-${String((idx % 28) + 1).padStart(2, '0')}`,
  }
})

function now(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export async function fetchAdmins(params: AdminSearchParams): Promise<Admin[]> {
  if (import.meta.env.DEV) {
    const filtered = MOCK_ADMINS.filter((admin) => {
      const matchesKeyword = params.keyword
        ? admin.adminName.includes(params.keyword) ||
          admin.adminId.includes(params.keyword) ||
          admin.email.includes(params.keyword)
        : true
      // updatedAt은 시:분:초까지 포함할 수 있어, 날짜만 있는 검색 범위와 비교할 때는 날짜 부분만 잘라 비교한다.
      const matchesDate =
        !params.updatedFrom || !params.updatedTo
          ? true
          : admin.updatedAt.slice(0, 10) >= params.updatedFrom &&
            admin.updatedAt.slice(0, 10) <= params.updatedTo
      const matchesDepartment =
        !params.department || params.department === 'ALL'
          ? true
          : admin.department === params.department
      const matchesStatus =
        !params.status || params.status === 'ALL' ? true : admin.status === params.status
      return matchesKeyword && matchesDate && matchesDepartment && matchesStatus
    })
    return delay(filtered)
  }

  const { data } = await apiClient.get<Admin[]>('/admins', { params })
  return data
}

export async function createAdmin(payload: CreateAdminPayload): Promise<Admin> {
  if (import.meta.env.DEV) {
    // password는 서버에서 해시로 저장하는 값이라 목데이터에는 남기지 않는다.
    const { password: _password, ...rest } = payload
    const created: Admin = {
      id: String(Date.now()),
      ...rest,
      workspaceAdmin: false,
      groups: [],
      status: 'NEW',
      updatedAt: dayjs().format('YYYY-MM-DD'),
    }
    MOCK_ADMINS.unshift(created)
    return delay(created)
  }

  const { data } = await apiClient.post<Admin>('/admins', payload)
  return data
}

export async function updateAdmin(payload: UpdateAdminPayload): Promise<Admin> {
  if (import.meta.env.DEV) {
    const index = MOCK_ADMINS.findIndex((admin) => admin.id === payload.id)
    if (index === -1) throw new Error('Admin not found')
    const { id: _id, ...rest } = payload
    // 기존 객체를 mutate하면 Ag-Grid가 참조 동일성으로 변경 감지를 못한다 — 새 객체로 교체.
    const updated: Admin = { ...MOCK_ADMINS[index], ...rest, updatedAt: now() }
    MOCK_ADMINS[index] = updated
    return delay(updated)
  }

  const { id, ...body } = payload
  const { data } = await apiClient.put<Admin>(`/admins/${id}`, body)
  return data
}

export async function deleteAdmin(id: string): Promise<void> {
  if (import.meta.env.DEV) {
    const index = MOCK_ADMINS.findIndex((admin) => admin.id === id)
    if (index === -1) throw new Error('Admin not found')
    MOCK_ADMINS.splice(index, 1)
    await delay(undefined)
    return
  }

  await apiClient.delete(`/admins/${id}`)
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

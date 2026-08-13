import { apiClient } from '@/lib/axios'
import type {
  Admin,
  AdminSearchParams,
  CreateAdminPayload,
  UpdateAdminPayload,
  UpdateAdminRolesPayload,
} from '@/types/admin'

// 백엔드 응답 필드명은 loginId/groupCodes를 쓰지만, 화면 쪽 타입(Admin)은 adminId/groups로 부릅니다.
// department는 DB 컬럼이 NULL 허용이라 빈 문자열로 치환해 화면에서 항상 string으로 다룰 수 있게 합니다.
interface AdminApiItem extends Omit<Admin, 'adminId' | 'groups' | 'department'> {
  loginId: string
  groupCodes: string[]
  department: string | null
}

function toAdmin(raw: AdminApiItem): Admin {
  const { loginId, groupCodes, department, ...rest } = raw
  return { ...rest, adminId: loginId, groups: groupCodes, department: department ?? '' }
}

export async function fetchAdmins(params: AdminSearchParams): Promise<Admin[]> {
  const { data } = await apiClient.get<AdminApiItem[]>('/admins', {
    params: {
      keyword: params.keyword || undefined,
      department: params.department === 'ALL' ? undefined : params.department,
      status: params.status === 'ALL' ? undefined : params.status,
    },
  })
  return data.map(toAdmin)
}

export async function createAdmin(payload: CreateAdminPayload): Promise<Admin> {
  const { adminId, ...rest } = payload
  const { data } = await apiClient.post<AdminApiItem>('/admins', { ...rest, loginId: adminId })
  return toAdmin(data)
}

export async function updateAdmin(payload: UpdateAdminPayload): Promise<Admin> {
  const { id, groups, ...rest } = payload
  const { data } = await apiClient.put<AdminApiItem>(`/admins/${id}`, {
    ...rest,
    groupCodes: groups,
  })
  return toAdmin(data)
}

export async function deleteAdmin(id: string): Promise<void> {
  await apiClient.delete(`/admins/${id}`)
}

export async function updateAdminRoles(payload: UpdateAdminRolesPayload): Promise<Admin> {
  const { data } = await apiClient.put<AdminApiItem>(`/admins/${payload.id}/roles`, {
    roleIds: payload.roleIds,
  })
  return toAdmin(data)
}

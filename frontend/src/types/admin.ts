// 관리자 상태값/소속그룹은 하드코딩하지 않고 공통코드(그룹코드 ADMIN_STATUS/ADMIN_GROUP)에서 관리합니다.
// 라벨/배지 색상은 common-code-api의 코드 항목(codeName/metadata)에서 조회하세요.
export const ADMIN_STATUS_GROUP_CODE = 'ADMIN_STATUS'
export const ADMIN_GROUP_GROUP_CODE = 'ADMIN_GROUP'

export const ADMIN_DEPARTMENTS = ['콘텐츠운영팀', '라이선스팀', '플랫폼개발팀', '데이터팀'] as const
export type AdminDepartment = (typeof ADMIN_DEPARTMENTS)[number]

export interface Admin {
  id: string
  adminId: string
  adminName: string
  email: string
  department: string
  roleIds: string[]
  groups: string[]
  serviceExpiresAt?: string
  lastLoginAt?: string
  status: string
  updatedAt: string
}

export interface AdminSearchParams {
  keyword: string
  department: AdminDepartment | 'ALL'
  status: string
}

// 등록자는 서버가 인증 토큰(JWT)에서 직접 판단하므로 요청 payload에는 포함하지 않습니다.
export interface CreateAdminPayload {
  adminId: string
  adminName: string
  email: string
  password: string
  department: string
  roleIds: string[]
}

export interface UpdateAdminPayload {
  id: string
  adminName: string
  email: string
  department: string
  status: string
  groups: string[]
  serviceExpiresAt?: string
}

export interface UpdateAdminRolesPayload {
  id: string
  roleIds: string[]
}

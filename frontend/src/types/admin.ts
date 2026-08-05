// 관리자 상태값은 하드코딩하지 않고 공통코드(그룹코드 ADMIN_STATUS)에서 관리합니다.
// 라벨/배지 색상은 common-code-api의 코드 항목(codeName/metadata)에서 조회하세요.
export const ADMIN_STATUS_GROUP_CODE = 'ADMIN_STATUS'

export const ADMIN_DEPARTMENTS = ['콘텐츠운영팀', '라이선스팀', '플랫폼개발팀', '데이터팀'] as const
export type AdminDepartment = (typeof ADMIN_DEPARTMENTS)[number]

export interface Admin {
  id: string
  adminId: string
  adminName: string
  email: string
  department: string
  roleIds: string[]
  // 워크스페이스 전체 관리 권한 여부. 세부 메뉴 권한(roleIds)과 별개로 관리자 콘솔 접근 가능 여부를 나타낸다.
  workspaceAdmin: boolean
  groups: string[]
  serviceExpiresAt?: string
  lastLoginAt?: string
  status: string
  registrant: string
  updatedAt: string
}

export interface AdminSearchParams {
  updatedFrom: string
  updatedTo: string
  keyword: string
  department: AdminDepartment | 'ALL'
  status: string
}

export interface CreateAdminPayload {
  adminId: string
  adminName: string
  email: string
  password: string
  department: string
  roleIds: string[]
  registrant: string
}

export interface UpdateAdminPayload {
  id: string
  adminName: string
  email: string
  department: string
  status: string
  registrant: string
  workspaceAdmin: boolean
  groups: string[]
  serviceExpiresAt?: string
}

export interface UpdateAdminRolesPayload {
  id: string
  roleIds: string[]
}

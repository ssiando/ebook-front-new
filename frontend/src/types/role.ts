// SYSTEMS/SystemName은 역할 자체가 아니라 프로그램(program) 도메인에서 시스템 구분에 사용합니다.
export const SYSTEMS = ['VFX', 'GENX', '4DX', 'ASSET', 'DESK'] as const
export type SystemName = (typeof SYSTEMS)[number]
export type SystemFilter = 'ALL' | SystemName

export interface Role {
  id: string
  roleName: string
  description: string
  memberCount: number
  programIds: string[]
  registrant: string
  createdAt: string
  updatedAt: string
}

export interface RoleSearchParams {
  keyword: string
}

export interface CreateRolePayload {
  roleName: string
  description: string
  registrant: string
}

export interface UpdateRolePayload {
  id: string
  roleName: string
  description: string
  registrant: string
}

export interface UpdateRoleProgramsPayload {
  id: string
  programIds: string[]
}

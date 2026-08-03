export const SYSTEMS = ['VFX', 'GENX', '4DX', 'ASSET', 'DESK'] as const
export type SystemName = (typeof SYSTEMS)[number]

export interface Role {
  id: string
  roleName: string
  description: string
  system: SystemName
  memberCount: number
  programIds: string[]
  registrant: string
  createdAt: string
  updatedAt: string
}

export interface RoleListResponse {
  items: Role[]
  totalCount: number
}

export type SystemFilter = 'ALL' | SystemName

export interface RoleSearchParams {
  system: SystemFilter
  keyword: string
  page: number
  pageSize: number
}

export interface UpdateRoleProgramsPayload {
  id: string
  programIds: string[]
}

export interface Role {
  id: string
  roleName: string
  description: string
  menuIds: string[]
  useYn: boolean
  registrant: string
  updatedAt: string
}

export interface RoleListResponse {
  items: Role[]
  totalCount: number
}

export interface RoleSearchParams {
  keyword: string
}

export interface CreateRolePayload {
  roleName: string
  description: string
}

export interface UpdateRoleMenusPayload {
  id: string
  menuIds: string[]
}

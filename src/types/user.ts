export type UserRole = 'ADMIN' | 'MANAGER' | 'MEMBER'

export interface UserProject {
  id: string
  name: string
}

export interface User {
  id: string
  userId: string
  userName: string
  department: string
  role: UserRole
  isActive: boolean
  projects: UserProject[]
  registrant: string
  updatedAt: string
}

export interface UserSearchParams {
  updatedFrom: string
  updatedTo: string
  keyword: string
  page: number
  pageSize: number
}

export interface UserListResponse {
  items: User[]
  totalCount: number
}

export interface CreateUserPayload {
  userId: string
  userName: string
  department: string
  role: UserRole
}

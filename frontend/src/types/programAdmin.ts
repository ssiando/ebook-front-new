export type ProgramType = 'API' | 'PAGE'
export type HttpMethod = '' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ProgramAdminItem {
  id: number
  workspaceId: number
  parentProgramId: number | null
  code: string
  name: string
  type: ProgramType
  httpMethod: HttpMethod
  url: string
  sortOrder: number
  displayYn: boolean
  useYn: boolean
  i18nKeyId: number | null
  description: string
  createdAt: string
  updatedAt: string
}

export interface ProgramAdminListResponse {
  items: ProgramAdminItem[]
  totalCount: number
}

export type ProgramTypeFilter = 'ALL' | ProgramType
export type UseYnFilter = 'ALL' | 'Y' | 'N'

export interface ProgramSearchParams {
  workspaceId: number
  keyword: string
  type: ProgramTypeFilter
  useYn: UseYnFilter
}

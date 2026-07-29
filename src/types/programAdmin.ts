import type { SystemName } from '@/types/role'

export type ProgramType = 'API' | 'PAGE'
export type HttpMethod = '' | 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface ProgramAdminItem {
  id: number
  system: SystemName
  parentProgramId: number | null
  code: string
  name: string
  type: ProgramType
  httpMethod: HttpMethod
  url: string
  sortOrder: number
  displayYn: boolean
  useYn: boolean
  platformAdminOnly: boolean
  i18nKeyId: string
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
  system: SystemName
  keyword: string
  type: ProgramTypeFilter
  useYn: UseYnFilter
}

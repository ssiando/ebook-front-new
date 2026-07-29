export interface CodeGroup {
  id: string
  groupCode: string
  groupName: string
  description: string
  useYn: boolean
  i18nKey: string
  createdAt: string
  updatedAt: string
}

export interface CodeItem {
  id: string
  groupId: string
  code: string
  codeName: string
  sortOrder: number
  useYn: boolean
  description: string
  metadata: string
  i18nKey: string
  createdAt: string
  updatedAt: string
}

export interface CodeGroupListResponse {
  items: CodeGroup[]
  totalCount: number
}

export interface CodeItemListResponse {
  items: CodeItem[]
  totalCount: number
}

export type UseYnFilter = 'ALL' | 'Y' | 'N'

export interface CommonCodeSearchParams {
  keyword: string
  useYn: UseYnFilter
}

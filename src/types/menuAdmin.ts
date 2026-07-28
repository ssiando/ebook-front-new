export interface MenuAdminItem {
  id: string
  label: string
  parentLabel: string
  path: string
  sortOrder: number
  useYn: boolean
  updatedAt: string
}

export interface MenuAdminListResponse {
  items: MenuAdminItem[]
  totalCount: number
}

export interface MenuSearchParams {
  keyword: string
}

export interface CreateMenuPayload {
  label: string
  parentLabel: string
  path: string
}

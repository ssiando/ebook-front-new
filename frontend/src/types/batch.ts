export type BatchRunStatus = 'success' | 'error' | 'default'

export interface Batch {
  id: string
  batchCode: string
  batchName: string
  schedule: string
  updatedAt: string
  status: BatchRunStatus
}

export interface BatchListResponse {
  items: Batch[]
  totalCount: number
}

export interface BatchSearchParams {
  keyword: string
  page: number
  pageSize: number
}

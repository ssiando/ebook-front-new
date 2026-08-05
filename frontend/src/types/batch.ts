export type BatchRunStatus = 'success' | 'error' | 'default'

export interface Batch {
  id: string
  batchCode: string
  batchName: string
  schedule: string
  updatedAt: string
  status: BatchRunStatus
}

export interface BatchSearchParams {
  keyword: string
}

export type BatchRunStatus = 'success' | 'error' | 'default'

export interface Batch {
  id: string
  batchCode: string
  batchName: string
  schedule: string
  description: string
  updatedAt: string
  status: BatchRunStatus
  /** true면 실행 시 백업 파일을 저장할 경로를 입력받는 모달을 먼저 띄운다 (예: DB 백업 배치). */
  requiresPath: boolean
}

export interface BatchSearchParams {
  keyword: string
}

export interface CreateBatchPayload {
  batchCode: string
  batchName: string
  schedule: string
  description: string
  requiresPath: boolean
}

export interface UpdateBatchPayload {
  id: string
  batchName: string
  schedule: string
  description: string
  requiresPath: boolean
}

export interface DbBackupRunResult {
  filePath: string
  fileSizeBytes: number
  executedAt: string
}

export type JobResultStatus = 'SUCCESS' | 'FAILED'

export interface DbBackup {
  id: string
  backupName: string
  filePath: string
  fileSizeBytes: number
  status: JobResultStatus
  restoredAt: string | null
  restoreStatus: JobResultStatus | null
  createdAt: string
  updatedAt: string
}

export interface DbBackupSearchParams {
  keyword: string
}

export interface UpdateDbBackupPayload {
  id: string
  backupName: string
}

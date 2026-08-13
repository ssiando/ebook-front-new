import dayjs from 'dayjs'
import { apiClient } from '@/lib/axios'
import type {
  Batch,
  BatchRunStatus,
  BatchSearchParams,
  CreateBatchPayload,
  DbBackupRunResult,
  UpdateBatchPayload,
} from '@/types/batch'

/** 경로 입력이 필요한 배치 실행 대상의 배치 코드. 실제 백엔드(Spring Batch) 연동 배치는 이 코드 하나뿐이다. */
export const DB_BACKUP_BATCH_CODE = 'BATCH_DB_BACKUP'

// 백엔드 응답 필드명(batchCode/lastRunStatus/lastRunAt)을 화면 쪽 타입(Batch)의 status/updatedAt으로 변환합니다.
interface BatchApiItem {
  id: number
  batchCode: string
  batchName: string
  schedule: string | null
  description: string | null
  requiresPath: boolean
  lastRunStatus: BatchRunStatus
  lastRunAt: string | null
}

function toBatch(raw: BatchApiItem): Batch {
  return {
    id: String(raw.id),
    batchCode: raw.batchCode,
    batchName: raw.batchName,
    schedule: raw.schedule ?? '',
    description: raw.description ?? '',
    requiresPath: raw.requiresPath,
    status: raw.lastRunStatus,
    updatedAt: raw.lastRunAt ? dayjs(raw.lastRunAt).format('YYYY-MM-DD HH:mm:ss') : '',
  }
}

export async function fetchBatches(params: BatchSearchParams): Promise<Batch[]> {
  const { data } = await apiClient.get<BatchApiItem[]>('/batch', {
    params: { keyword: params.keyword || undefined },
  })
  return data.map(toBatch)
}

export async function createBatch(payload: CreateBatchPayload): Promise<Batch> {
  const { data } = await apiClient.post<BatchApiItem>('/batch', payload)
  return toBatch(data)
}

export async function updateBatch(payload: UpdateBatchPayload): Promise<Batch> {
  const { id, ...rest } = payload
  const { data } = await apiClient.put<BatchApiItem>(`/batch/${id}`, rest)
  return toBatch(data)
}

export async function deleteBatch(id: string): Promise<void> {
  await apiClient.delete(`/batch/${id}`)
}

export async function runBatch(id: string, batchCode: string, targetPath?: string): Promise<void> {
  // DB 백업 배치는 일반 실행 API가 아니라 실제 Spring Batch 백엔드(POST /batch/db-backup/run)를 호출한다.
  if (batchCode === DB_BACKUP_BATCH_CODE) {
    await apiClient.post<DbBackupRunResult>('/batch/db-backup/run', { targetPath })
    return
  }

  await apiClient.post<BatchApiItem>(`/batch/${id}/run`)
}

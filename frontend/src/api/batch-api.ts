import dayjs from 'dayjs'
import { apiClient } from '@/lib/axios'
import { delay } from '@/utils/delay'
import type { Batch, BatchSearchParams } from '@/types/batch'

// NOTE: 백엔드 연동 전까지 화면 확인용 목데이터를 사용합니다.
// 실제 연동 시 아래 목데이터/지연 로직을 제거하고 apiClient 호출만 남기면 됩니다.
const MOCK_BATCHES: Batch[] = [
  {
    id: 'BATCH_EAI_HR',
    batchCode: 'BATCH_EAI_HR',
    batchName: 'EAI 인사정보 동기화 배치',
    schedule: '매일 06:10',
    updatedAt: '2026-07-29 06:33:21',
    status: 'error',
  },
  {
    id: 'BATCH_EAI_OFCWRK_TM',
    batchCode: 'BATCH_EAI_OFCWRK_TM',
    batchName: 'EAI 근무시간 동기화 배치',
    schedule: '매일 06:20',
    updatedAt: '2026-07-29 06:43:34',
    status: 'error',
  },
  {
    id: 'BATCH_USER_EXPIRY',
    batchCode: 'BATCH_USER_EXPIRY',
    batchName: '만료 사용자 비활성화 배치',
    schedule: '매일 01:00',
    updatedAt: '2026-07-30 01:30:00',
    status: 'success',
  },
  {
    id: 'BATCH_NOTI_RESEND',
    batchCode: 'BATCH_NOTI_RESEND',
    batchName: '알람 재전송 배치',
    schedule: '1시간 간격 실행',
    updatedAt: '2026-07-30 15:26:15',
    status: 'success',
  },
  {
    id: 'BATCH_FPTR_PERMISSION',
    batchCode: 'BATCH_FPTR_PERMISSION',
    batchName: 'FPTR PermissionRuleSet 마스터정보 동기화 배치',
    schedule: '매일 09:00',
    updatedAt: '2026-07-30 11:31:02',
    status: 'success',
  },
  {
    id: 'BATCH_FPTR_DEPT',
    batchCode: 'BATCH_FPTR_DEPT',
    batchName: 'FPTR Department 마스터정보 동기화 배치',
    schedule: '매일 09:00',
    updatedAt: '2026-07-30 11:21:12',
    status: 'success',
  },
  {
    id: 'BATCH_FPTR_TO_VANTA_SYNC',
    batchCode: 'BATCH_FPTR_TO_VANTA_SYNC',
    batchName: 'FPTR To VANTA 동기화배치',
    schedule: 'system-master.col.scheduleFptrToVanta...',
    updatedAt: '2026-07-03 14:04:43',
    status: 'success',
  },
  {
    id: 'BATCH_FPTR_USER',
    batchCode: 'BATCH_FPTR_USER',
    batchName: 'FPTR HumanUser 마스터정보 동기화 배치',
    schedule: '매일 09:00',
    updatedAt: '2026-07-30 11:21:25',
    status: 'success',
  },
  {
    id: 'BATCH_WS_TERMINATION',
    batchCode: 'BATCH_WS_TERMINATION',
    batchName: '워크스페이스 유휴 종료',
    schedule: '',
    updatedAt: '',
    status: 'default',
  },
]

function now(): string {
  return dayjs().format('YYYY-MM-DD HH:mm:ss')
}

export async function fetchBatches(params: BatchSearchParams): Promise<Batch[]> {
  if (import.meta.env.DEV) {
    const filtered = MOCK_BATCHES.filter((batch) =>
      params.keyword ? batch.batchName.includes(params.keyword) : true,
    )
    return delay(filtered)
  }

  const { data } = await apiClient.get<Batch[]>('/batches', { params })
  return data
}

export async function runBatch(id: string): Promise<Batch> {
  if (import.meta.env.DEV) {
    const index = MOCK_BATCHES.findIndex((batch) => batch.id === id)
    if (index === -1) throw new Error('Batch not found')
    // 기존 객체를 mutate하면 Ag-Grid가 참조 동일성으로 변경 감지를 못한다 — 새 객체로 교체.
    const updated: Batch = { ...MOCK_BATCHES[index], status: 'success', updatedAt: now() }
    MOCK_BATCHES[index] = updated
    return delay(updated)
  }

  const { data } = await apiClient.post<Batch>(`/batches/${id}/run`)
  return data
}

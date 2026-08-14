import { apiClient } from '@/lib/axios'
import type { DbBackup, DbBackupSearchParams, UpdateDbBackupPayload } from '@/types/dbBackup'

// 백엔드는 id를 Long(JSON number)으로 내려주지만, 화면 쪽 타입은 string으로 다룬다.
function toDbBackup(raw: DbBackup): DbBackup {
  return { ...raw, id: String(raw.id) }
}

export async function fetchDbBackups(params: DbBackupSearchParams): Promise<DbBackup[]> {
  const { data } = await apiClient.get<DbBackup[]>('/db-backups', {
    params: { keyword: params.keyword || undefined },
  })
  return data.map(toDbBackup)
}

export async function runDbBackup(): Promise<DbBackup> {
  const { data } = await apiClient.post<DbBackup>('/db-backups/run')
  return toDbBackup(data)
}

export async function runDbRestore(id: string): Promise<DbBackup> {
  const { data } = await apiClient.post<DbBackup>(`/db-backups/${id}/restore`)
  return toDbBackup(data)
}

export async function updateDbBackup(payload: UpdateDbBackupPayload): Promise<DbBackup> {
  const { id, ...rest } = payload
  const { data } = await apiClient.put<DbBackup>(`/db-backups/${id}`, rest)
  return toDbBackup(data)
}

export async function deleteDbBackup(id: string): Promise<void> {
  await apiClient.delete(`/db-backups/${id}`)
}

import { apiClient } from '@/lib/axios'
import type {
  ProgramAdminItem,
  ProgramAdminListResponse,
  ProgramSearchParams,
} from '@/types/programAdmin'

export async function fetchPrograms(
  params: ProgramSearchParams,
): Promise<ProgramAdminListResponse> {
  const { data } = await apiClient.get<ProgramAdminListResponse>('/programs', { params })
  return data
}

export async function savePrograms(
  programs: ProgramAdminItem[],
): Promise<ProgramAdminListResponse> {
  const { data } = await apiClient.put<ProgramAdminListResponse>('/programs', { programs })
  return data
}

export async function deletePrograms(ids: number[]): Promise<void> {
  await apiClient.delete('/programs', { data: { ids } })
}

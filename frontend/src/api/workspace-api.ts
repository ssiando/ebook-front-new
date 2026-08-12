import { apiClient } from '@/lib/axios'
import type { WorkspaceOption } from '@/types/workspace'

export async function fetchWorkspaces(): Promise<WorkspaceOption[]> {
  const { data } = await apiClient.get<WorkspaceOption[]>('/workspaces')
  return data
}

import { useQuery } from '@tanstack/react-query'
import { fetchWorkspaces } from '@/api/workspace-api'

export const workspaceKeys = {
  all: ['workspaces'] as const,
}

export function useWorkspacesQuery() {
  return useQuery({
    queryKey: workspaceKeys.all,
    queryFn: fetchWorkspaces,
  })
}

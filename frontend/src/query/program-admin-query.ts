import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deletePrograms, fetchPrograms, savePrograms } from '@/api/program-admin-api'
import type { ProgramAdminItem, ProgramSearchParams } from '@/types/programAdmin'

export const programAdminKeys = {
  all: ['programs'] as const,
  list: (params: ProgramSearchParams) => [...programAdminKeys.all, 'list', params] as const,
}

export function useProgramsQuery(params: ProgramSearchParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: programAdminKeys.list(params),
    queryFn: () => fetchPrograms(params),
    placeholderData: (prev) => prev,
    enabled: options?.enabled,
  })
}

export function useSaveProgramsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (programs: ProgramAdminItem[]) => savePrograms(programs),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programAdminKeys.all })
    },
  })
}

export function useDeleteProgramsMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (ids: number[]) => deletePrograms(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: programAdminKeys.all })
    },
  })
}

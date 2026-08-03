import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchBatches, runBatch } from '@/api/batch-api'
import type { BatchSearchParams } from '@/types/batch'

export const batchKeys = {
  all: ['batches'] as const,
  list: (params: BatchSearchParams) => [...batchKeys.all, 'list', params] as const,
}

export function useBatchesQuery(params: BatchSearchParams) {
  return useQuery({
    queryKey: batchKeys.list(params),
    queryFn: () => fetchBatches(params),
    placeholderData: (prev) => prev,
  })
}

export function useRunBatchMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => runBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all })
    },
  })
}

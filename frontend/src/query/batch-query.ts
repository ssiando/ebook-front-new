import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createBatch, deleteBatch, fetchBatches, runBatch, updateBatch } from '@/api/batch-api'
import type { BatchSearchParams, CreateBatchPayload, UpdateBatchPayload } from '@/types/batch'

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

export function useCreateBatchMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateBatchPayload) => createBatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all })
    },
  })
}

export function useUpdateBatchMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: UpdateBatchPayload) => updateBatch(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all })
    },
  })
}

export function useDeleteBatchMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBatch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all })
    },
  })
}

export function useRunBatchMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      id,
      batchCode,
      targetPath,
    }: {
      id: string
      batchCode: string
      targetPath?: string
    }) => runBatch(id, batchCode, targetPath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: batchKeys.all })
    },
  })
}

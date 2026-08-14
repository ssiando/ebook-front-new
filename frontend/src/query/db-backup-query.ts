import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  deleteDbBackup,
  fetchDbBackups,
  runDbBackup,
  runDbRestore,
  updateDbBackup,
} from '@/api/db-backup-api'
import type { DbBackupSearchParams } from '@/types/dbBackup'

export const dbBackupKeys = {
  all: ['dbBackups'] as const,
  list: (params: DbBackupSearchParams) => [...dbBackupKeys.all, 'list', params] as const,
}

export function useDbBackupsQuery(params: DbBackupSearchParams) {
  return useQuery({
    queryKey: dbBackupKeys.list(params),
    queryFn: () => fetchDbBackups(params),
    placeholderData: (prev) => prev,
  })
}

export function useRunDbBackupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: runDbBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbBackupKeys.all })
    },
  })
}

export function useRunDbRestoreMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: runDbRestore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbBackupKeys.all })
    },
  })
}

export function useUpdateDbBackupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: updateDbBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbBackupKeys.all })
    },
  })
}

export function useDeleteDbBackupMutation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteDbBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dbBackupKeys.all })
    },
  })
}

import { useState } from 'react'
import { DatabaseBackup } from 'lucide-react'
import { DbBackupListGrid } from './DbBackupListGrid'
import { DbBackupRenameModal } from './DbBackupRenameModal'
import { Button } from '@/components/common/ui/Button'
import {
  useDeleteDbBackupMutation,
  useRunDbBackupMutation,
  useRunDbRestoreMutation,
} from '@/query/db-backup-query'
import { useToastStore } from '@/store/useToastStore'
import { confirm } from '@/store/useConfirmStore'
import type { DbBackup } from '@/types/dbBackup'

interface DbBackupContentProps {
  data: DbBackup[] | undefined
  isLoading: boolean
}

export function DbBackupContent({ data, isLoading }: DbBackupContentProps) {
  const rows = data ?? []
  const [renameTarget, setRenameTarget] = useState<DbBackup | null>(null)
  const runBackup = useRunDbBackupMutation()
  const runRestore = useRunDbRestoreMutation()
  const deleteBackup = useDeleteDbBackupMutation()

  const handleBackupClick = () => {
    runBackup.mutate(undefined, {
      onSuccess: (backup) => {
        useToastStore.getState().push(`"${backup.backupName}" 백업이 완료되었습니다.`)
      },
      onError: (error) => {
        useToastStore
          .getState()
          .push(error instanceof Error ? error.message : 'DB 백업에 실패했습니다.')
      },
    })
  }

  const handleRestoreClick = async (backup: DbBackup) => {
    const confirmed = await confirm(
      `"${backup.backupName}" 백업으로 DB를 복원하시겠습니까?\n현재 데이터는 백업 시점 데이터로 되돌아갑니다.`,
    )
    if (!confirmed) return
    runRestore.mutate(backup.id, {
      onSuccess: () => {
        useToastStore.getState().push(`"${backup.backupName}" 백업으로 복원했습니다.`)
      },
      onError: (error) => {
        useToastStore
          .getState()
          .push(error instanceof Error ? error.message : 'DB 복원에 실패했습니다.')
      },
    })
  }

  const handleDeleteClick = async (backup: DbBackup) => {
    if (!(await confirm(`"${backup.backupName}" 백업을 삭제하시겠습니까?`))) return
    deleteBackup.mutate(backup.id)
  }

  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-sm text-gray-500">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
          백업 목록 총 {rows.length}건
        </span>
        <Button type="button" variant="primary" onClick={handleBackupClick} disabled={runBackup.isPending}>
          <DatabaseBackup size={14} />
          {runBackup.isPending ? 'DB 백업 중...' : 'DB 백업'}
        </Button>
      </div>

      <DbBackupListGrid
        rows={rows}
        loading={isLoading}
        restoringId={runRestore.isPending ? (runRestore.variables ?? null) : null}
        onRestoreClick={handleRestoreClick}
        onRenameClick={setRenameTarget}
        onDeleteClick={handleDeleteClick}
      />

      <DbBackupRenameModal
        open={renameTarget !== null}
        target={renameTarget}
        onClose={() => setRenameTarget(null)}
      />
    </div>
  )
}

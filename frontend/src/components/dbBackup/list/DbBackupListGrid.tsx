import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, type ColDef, type ValueGetterParams } from 'ag-grid-community'
import { HistoryIcon, Pencil, Trash2 } from 'lucide-react'
import { Badge, type BadgeTone } from '@/components/common/ui/Badge'
import type { DbBackup, JobResultStatus } from '@/types/dbBackup'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

const STATUS_LABELS: Record<JobResultStatus, string> = {
  SUCCESS: '성공',
  FAILED: '실패',
}

const STATUS_TONES: Record<JobResultStatus, BadgeTone> = {
  SUCCESS: 'green',
  FAILED: 'red',
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return '-'
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

interface DbBackupListGridProps {
  rows: DbBackup[]
  loading: boolean
  restoringId: string | null
  onRestoreClick: (backup: DbBackup) => void
  onRenameClick: (backup: DbBackup) => void
  onDeleteClick: (backup: DbBackup) => void
}

export function DbBackupListGrid({
  rows,
  loading,
  restoringId,
  onRestoreClick,
  onRenameClick,
  onDeleteClick,
}: DbBackupListGridProps) {
  const columnDefs = useMemo<ColDef<DbBackup>[]>(
    () => [
      {
        headerName: 'No',
        width: 56,
        valueGetter: (p: ValueGetterParams<DbBackup>) => (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'backupName', headerName: '백업명', flex: 1.2, minWidth: 200 },
      {
        field: 'fileSizeBytes',
        headerName: '파일크기',
        width: 100,
        valueFormatter: (p) => formatFileSize(Number(p.value)),
      },
      {
        field: 'status',
        headerName: '백업상태',
        width: 100,
        cellRenderer: (p: { value: JobResultStatus }) => (
          <Badge tone={STATUS_TONES[p.value]}>{STATUS_LABELS[p.value]}</Badge>
        ),
      },
      {
        field: 'restoredAt',
        headerName: '최근 복원일시',
        width: 140,
        valueFormatter: (p) => (p.value ? String(p.value).replace('T', ' ').slice(0, 16) : '-'),
      },
      {
        field: 'restoreStatus',
        headerName: '복원상태',
        width: 90,
        cellRenderer: (p: { value: JobResultStatus | null }) =>
          p.value ? <Badge tone={STATUS_TONES[p.value]}>{STATUS_LABELS[p.value]}</Badge> : <span className="text-gray-300">-</span>,
      },
      { field: 'createdAt', headerName: '생성일시', width: 140, valueFormatter: (p) => String(p.value).replace('T', ' ').slice(0, 16) },
      {
        headerName: '관리',
        width: 110,
        pinned: 'right',
        cellRenderer: (p: { data?: DbBackup }) =>
          p.data && (
            <div className="flex h-full items-center gap-2.5 text-gray-400">
              <button
                type="button"
                aria-label={`${p.data.backupName} 복원`}
                disabled={p.data.status !== 'SUCCESS' || restoringId === p.data.id}
                onClick={() => onRestoreClick(p.data!)}
                className="hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <HistoryIcon size={15} />
              </button>
              <button
                type="button"
                aria-label={`${p.data.backupName} 이름변경`}
                onClick={() => onRenameClick(p.data!)}
                className="hover:text-gray-600"
              >
                <Pencil size={14} />
              </button>
              <button
                type="button"
                aria-label={`${p.data.backupName} 삭제`}
                onClick={() => onDeleteClick(p.data!)}
                className="hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ),
      },
    ],
    [restoringId, onRestoreClick, onRenameClick, onDeleteClick],
  )

  return (
    <div style={{ height: 560 }}>
      <AgGridReact<DbBackup>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={48}
        headerHeight={40}
        getRowId={(p) => p.data.id}
        suppressCellFocus
      />
    </div>
  )
}

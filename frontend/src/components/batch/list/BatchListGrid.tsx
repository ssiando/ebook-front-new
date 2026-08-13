import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import {
  themeQuartz,
  type ColDef,
  type SelectionChangedEvent,
  type ValueGetterParams,
} from 'ag-grid-community'
import { Badge } from '@/components/common/ui/Badge'
import { Button } from '@/components/common/ui/Button'
import type { Batch } from '@/types/batch'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface BatchListGridProps {
  rows: Batch[]
  loading: boolean
  runningId: string | null
  onHistoryClick: (id: string) => void
  onRunClick: (id: string) => void
  onEditClick: (id: string) => void
  onSelectionChanged: (ids: string[]) => void
}

export function BatchListGrid({
  rows,
  loading,
  runningId,
  onHistoryClick,
  onRunClick,
  onEditClick,
  onSelectionChanged,
}: BatchListGridProps) {
  const columnDefs = useMemo<ColDef<Batch>[]>(
    () => [
      { headerCheckboxSelection: true, checkboxSelection: true, width: 44, pinned: 'left' },
      {
        headerName: '#',
        width: 60,
        valueGetter: (p: ValueGetterParams<Batch>) => (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'batchCode', headerName: '배치 코드', width: 180 },
      { field: 'batchName', headerName: '배치명', flex: 1, minWidth: 200 },
      { field: 'schedule', headerName: '정기배치 시간', width: 160 },
      { field: 'updatedAt', headerName: '최근업데이트일시', width: 150 },
      {
        field: 'status',
        headerName: '실행결과',
        width: 100,
        cellRenderer: (p: { value: Batch['status'] }) => {
          if (p.value === 'default') return <span className="text-xs text-gray-400">default</span>
          return <Badge tone={p.value === 'success' ? 'blue' : 'red'}>{p.value}</Badge>
        },
      },
      {
        headerName: '이력',
        width: 80,
        cellRenderer: (p: { data?: Batch }) => (
          <Button
            type="button"
            variant="secondary"
            className="h-6 px-2 text-xs"
            onClick={() => p.data && onHistoryClick(p.data.id)}
          >
            보기
          </Button>
        ),
      },
      {
        headerName: '수동 실행',
        width: 80,
        cellRenderer: (p: { data?: Batch }) => (
          <Button
            type="button"
            variant="primary"
            className="h-6 px-2 text-xs"
            disabled={!p.data || runningId === p.data.id}
            onClick={() => p.data && onRunClick(p.data.id)}
          >
            실행
          </Button>
        ),
      },
      {
        headerName: '수정',
        width: 80,
        cellRenderer: (p: { data?: Batch }) => (
          <Button
            type="button"
            variant="secondary"
            className="h-6 px-2 text-xs"
            onClick={() => p.data && onEditClick(p.data.id)}
          >
            수정
          </Button>
        ),
      },
    ],
    [runningId, onHistoryClick, onRunClick, onEditClick],
  )

  return (
    <div style={{ height: 480 }}>
      <AgGridReact<Batch>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={40}
        headerHeight={40}
        rowSelection="multiple"
        suppressRowClickSelection
        getRowId={(p) => p.data.id}
        onSelectionChanged={(e: SelectionChangedEvent<Batch>) =>
          onSelectionChanged(e.api.getSelectedRows().map((row) => row.id))
        }
        suppressCellFocus
      />
    </div>
  )
}

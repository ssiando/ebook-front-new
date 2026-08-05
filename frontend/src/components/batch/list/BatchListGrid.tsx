import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, type ColDef, type ValueGetterParams } from 'ag-grid-community'
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
}

export function BatchListGrid({
  rows,
  loading,
  runningId,
  onHistoryClick,
  onRunClick,
}: BatchListGridProps) {
  const columnDefs = useMemo<ColDef<Batch>[]>(
    () => [
      {
        headerName: '#',
        width: 70,
        valueGetter: (p: ValueGetterParams<Batch>) => (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'batchCode', headerName: '배치 코드', width: 200 },
      { field: 'batchName', headerName: '배치명', flex: 1, minWidth: 220 },
      { field: 'schedule', headerName: '정기배치 시간', width: 180 },
      { field: 'updatedAt', headerName: '최근업데이트일시', width: 160 },
      {
        field: 'status',
        headerName: '실행결과',
        width: 110,
        cellRenderer: (p: { value: Batch['status'] }) => {
          if (p.value === 'default') return <span className="text-xs text-gray-400">default</span>
          return <Badge tone={p.value === 'success' ? 'blue' : 'red'}>{p.value}</Badge>
        },
      },
      {
        headerName: '이력',
        width: 90,
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
        width: 90,
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
    ],
    [runningId, onHistoryClick, onRunClick],
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
        suppressCellFocus
      />
    </div>
  )
}

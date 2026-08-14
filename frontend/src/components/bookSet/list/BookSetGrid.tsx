import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import {
  themeQuartz,
  type ColDef,
  type RowClassRules,
  type RowClickedEvent,
  type ValueGetterParams,
} from 'ag-grid-community'
import { Badge } from '@/components/common/ui/Badge'
import type { BookSet } from '@/types/bookSet'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface BookSetGridProps {
  rows: BookSet[]
  loading: boolean
  selectedId: string | null
  onRowClick: (bookSet: BookSet) => void
}

export function BookSetGrid({ rows, loading, selectedId, onRowClick }: BookSetGridProps) {
  const rowClassRules = useMemo<RowClassRules<BookSet>>(
    () => ({
      'bg-rose-50': (p) => p.data?.id === selectedId,
    }),
    [selectedId],
  )

  const columnDefs = useMemo<ColDef<BookSet>[]>(
    () => [
      {
        headerName: 'No',
        width: 60,
        valueGetter: (p: ValueGetterParams<BookSet>) => (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'setName', headerName: '세트명', flex: 1.2, minWidth: 160 },
      {
        field: 'description',
        headerName: '설명',
        flex: 1.6,
        minWidth: 200,
        valueFormatter: (p) => p.value ?? '-',
      },
      { field: 'bookCount', headerName: '도서수', width: 90 },
      {
        field: 'activeYn',
        headerName: '상태',
        width: 90,
        cellRenderer: (p: { value: boolean }) => (
          <Badge tone={p.value ? 'green' : 'gray'}>{p.value ? '활성' : '비활성'}</Badge>
        ),
      },
    ],
    [],
  )

  return (
    <div style={{ height: 480 }}>
      <AgGridReact<BookSet>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={44}
        headerHeight={40}
        rowClassRules={rowClassRules}
        getRowId={(p) => p.data.id}
        onRowClicked={(e: RowClickedEvent<BookSet>) => e.data && onRowClick(e.data)}
        suppressCellFocus
      />
    </div>
  )
}

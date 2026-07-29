import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { themeQuartz, type ColDef } from 'ag-grid-community'
import { clsx } from '@/utils/clsx'
import type { ProgramItem } from '@/types/program'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface MenuGrantGridProps {
  rows: ProgramItem[]
  loading: boolean
  checkedIds: Set<string>
  disabled: boolean
  onToggle: (id: string, checked: boolean) => void
}

export function MenuGrantGrid({
  rows,
  loading,
  checkedIds,
  disabled,
  onToggle,
}: MenuGrantGridProps) {
  const columnDefs = useMemo<ColDef<ProgramItem>[]>(
    () => [
      { field: 'label', headerName: '메뉴명', flex: 1, minWidth: 150 },
      { field: 'code', headerName: '코드', flex: 1, minWidth: 150 },
      {
        field: 'type',
        headerName: '타입',
        width: 90,
        cellRenderer: (p: { value: 'API' | 'PAGE' }) => (
          <span
            className={clsx(
              'rounded px-1.5 py-0.5 text-xs',
              p.value === 'API' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600',
            )}
          >
            {p.value}
          </span>
        ),
      },
      {
        headerName: '메뉴 부여',
        width: 90,
        cellRenderer: (p: { data: ProgramItem }) => (
          <input
            type="checkbox"
            disabled={disabled}
            checked={checkedIds.has(p.data.id)}
            onChange={(e) => onToggle(p.data.id, e.target.checked)}
          />
        ),
      },
    ],
    [checkedIds, disabled, onToggle],
  )

  return (
    <div style={{ height: 420 }}>
      <AgGridReact<ProgramItem>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={38}
        headerHeight={38}
        getRowId={(p) => p.data.id}
        suppressCellFocus
      />
    </div>
  )
}

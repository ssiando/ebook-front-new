import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, SelectionChangedEvent, ValueGetterParams } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import { Search } from 'lucide-react'
import type { CodeGroup } from '@/types/commonCode'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface CodeGroupGridProps {
  rows: CodeGroup[]
  loading: boolean
  selectedId: string | null
  onSelectRow: (id: string) => void
  onCellChange: (id: string, field: keyof CodeGroup, value: string | boolean) => void
  onSelectionChange: (ids: string[]) => void
}

export function CodeGroupGrid({
  rows,
  loading,
  selectedId,
  onSelectRow,
  onCellChange,
  onSelectionChange,
}: CodeGroupGridProps) {
  const columnDefs = useMemo<ColDef<CodeGroup>[]>(
    () => [
      { headerCheckboxSelection: true, checkboxSelection: true, width: 44, pinned: 'left' },
      {
        headerName: '#',
        width: 60,
        valueGetter: (p: ValueGetterParams<CodeGroup>) => (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'groupCode', headerName: '그룹 코드 *', flex: 1, minWidth: 140, editable: true },
      { field: 'groupName', headerName: '그룹명 *', flex: 1, minWidth: 140, editable: true },
      { field: 'description', headerName: '설명', flex: 1.5, minWidth: 160, editable: true },
      {
        field: 'useYn',
        headerName: '사용',
        width: 80,
        cellRenderer: (p: { data: CodeGroup; value: boolean }) => (
          <input
            type="checkbox"
            checked={p.value}
            onChange={(e) => onCellChange(p.data.id, 'useYn', e.target.checked)}
          />
        ),
      },
      {
        field: 'i18nKey',
        headerName: 'i18n 키',
        flex: 1,
        minWidth: 140,
        editable: true,
        cellRenderer: (p: { value: string }) => (
          <span className="flex items-center gap-1">
            <span>{p.value}</span>
            <Search size={12} className="text-gray-400" />
          </span>
        ),
      },
      { field: 'createdAt', headerName: '등록일시', width: 160 },
      { field: 'updatedAt', headerName: '수정일시', width: 160 },
    ],
    [onCellChange],
  )

  return (
    <div style={{ height: 260 }}>
      <AgGridReact<CodeGroup>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={38}
        headerHeight={38}
        rowSelection="multiple"
        suppressRowClickSelection
        getRowId={(p) => p.data.id}
        onRowClicked={(e) => e.data && onSelectRow(e.data.id)}
        onSelectionChanged={(e: SelectionChangedEvent<CodeGroup>) =>
          onSelectionChange(e.api.getSelectedRows().map((row) => row.id))
        }
        getRowStyle={(p) => (p.data?.id === selectedId ? { background: '#fef2f2' } : undefined)}
        onCellValueChanged={(e) => {
          if (!e.data || !e.colDef.field) return
          onCellChange(e.data.id, e.colDef.field as keyof CodeGroup, e.newValue)
        }}
      />
    </div>
  )
}

import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, SelectionChangedEvent, ValueGetterParams } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import type { CodeItem } from '@/types/commonCode'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface CodeItemGridProps {
  rows: CodeItem[]
  loading: boolean
  onCellChange: (id: string, field: keyof CodeItem, value: string | number | boolean) => void
  onSelectionChange: (ids: string[]) => void
}

export function CodeItemGrid({
  rows,
  loading,
  onCellChange,
  onSelectionChange,
}: CodeItemGridProps) {
  const columnDefs = useMemo<ColDef<CodeItem>[]>(
    () => [
      { headerCheckboxSelection: true, checkboxSelection: true, width: 44, pinned: 'left' },
      {
        headerName: '#',
        width: 60,
        valueGetter: (p: ValueGetterParams<CodeItem>) => (p.node?.rowIndex ?? 0) + 1,
      },
      { field: 'code', headerName: '코드 *', width: 110, editable: true },
      { field: 'codeName', headerName: '코드명 *', flex: 1, minWidth: 140, editable: true },
      { field: 'sortOrder', headerName: '정렬', width: 80, editable: true },
      {
        field: 'useYn',
        headerName: '사용',
        width: 80,
        cellRenderer: (p: { data: CodeItem; value: boolean }) => (
          <input
            type="checkbox"
            checked={p.value}
            onChange={(e) => onCellChange(p.data.id, 'useYn', e.target.checked)}
          />
        ),
      },
      { field: 'description', headerName: '설명', flex: 1.5, minWidth: 180, editable: true },
      { field: 'metadata', headerName: 'metadata(JSON)', flex: 1, minWidth: 150, editable: true },
      { field: 'i18nKey', headerName: 'i18n 키', flex: 1, minWidth: 130, editable: true },
      { field: 'createdAt', headerName: '등록일시', width: 160 },
      { field: 'updatedAt', headerName: '수정일시', width: 160 },
    ],
    [onCellChange],
  )

  return (
    <div style={{ height: 260 }}>
      <AgGridReact<CodeItem>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={38}
        headerHeight={38}
        rowSelection="multiple"
        suppressRowClickSelection
        getRowId={(p) => p.data.id}
        onSelectionChanged={(e: SelectionChangedEvent<CodeItem>) =>
          onSelectionChange(e.api.getSelectedRows().map((row) => row.id))
        }
        onCellValueChanged={(e) => {
          if (!e.data || !e.colDef.field) return
          const field = e.colDef.field as keyof CodeItem
          const value = field === 'sortOrder' ? Number(e.newValue) : e.newValue
          onCellChange(e.data.id, field, value)
        }}
      />
    </div>
  )
}

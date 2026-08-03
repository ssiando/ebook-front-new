import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, SelectionChangedEvent } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import type { ProgramAdminItem } from '@/types/programAdmin'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface ProgramListGridProps {
  rows: ProgramAdminItem[]
  loading: boolean
  onCellChange: (
    id: number,
    field: keyof ProgramAdminItem,
    value: string | number | boolean | null,
  ) => void
  onSelectionChange: (ids: number[]) => void
}

function CheckboxCell({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
}

export function ProgramListGrid({
  rows,
  loading,
  onCellChange,
  onSelectionChange,
}: ProgramListGridProps) {
  const columnDefs = useMemo<ColDef<ProgramAdminItem>[]>(
    () => [
      { headerCheckboxSelection: true, checkboxSelection: true, width: 44, pinned: 'left' },
      { field: 'id', headerName: 'ID', width: 80 },
      {
        field: 'parentProgramId',
        headerName: '상위 프로그램 ID',
        width: 130,
        editable: true,
        valueFormatter: (p) => (p.value == null ? '' : String(p.value)),
      },
      { field: 'code', headerName: '코드 *', width: 170, editable: true },
      { field: 'name', headerName: '이름 *', width: 170, editable: true },
      {
        field: 'type',
        headerName: '타입 *',
        width: 90,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ['API', 'PAGE'] },
      },
      {
        field: 'httpMethod',
        headerName: 'HTTP Method',
        width: 120,
        editable: true,
        cellEditor: 'agSelectCellEditor',
        cellEditorParams: { values: ['', 'GET', 'POST', 'PUT', 'PATCH', 'DELETE'] },
      },
      { field: 'url', headerName: 'URL *', flex: 1, minWidth: 220, editable: true },
      { field: 'sortOrder', headerName: '정렬', width: 80, editable: true },
      {
        field: 'displayYn',
        headerName: '표시',
        width: 70,
        cellRenderer: (p: { data: ProgramAdminItem; value: boolean }) => (
          <CheckboxCell
            checked={p.value}
            onChange={(v) => onCellChange(p.data.id, 'displayYn', v)}
          />
        ),
      },
      {
        field: 'useYn',
        headerName: '사용여부',
        width: 80,
        cellRenderer: (p: { data: ProgramAdminItem; value: boolean }) => (
          <CheckboxCell checked={p.value} onChange={(v) => onCellChange(p.data.id, 'useYn', v)} />
        ),
      },
      {
        field: 'platformAdminOnly',
        headerName: '플랫폼 관리자 전용',
        width: 130,
        cellRenderer: (p: { data: ProgramAdminItem; value: boolean }) => (
          <CheckboxCell
            checked={p.value}
            onChange={(v) => onCellChange(p.data.id, 'platformAdminOnly', v)}
          />
        ),
      },
      { field: 'i18nKeyId', headerName: 'i18n 키 ID', width: 110, editable: true },
      { field: 'description', headerName: '설명', flex: 1, minWidth: 160, editable: true },
      { field: 'createdAt', headerName: '등록일시', width: 150 },
      { field: 'updatedAt', headerName: '수정일시', width: 150 },
    ],
    [onCellChange],
  )

  return (
    <div style={{ height: 480 }}>
      <AgGridReact<ProgramAdminItem>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={38}
        headerHeight={38}
        rowSelection="multiple"
        suppressRowClickSelection
        getRowId={(p) => String(p.data.id)}
        onSelectionChanged={(e: SelectionChangedEvent<ProgramAdminItem>) =>
          onSelectionChange(e.api.getSelectedRows().map((row) => row.id))
        }
        onCellValueChanged={(e) => {
          if (!e.data || !e.colDef.field) return
          const field = e.colDef.field as keyof ProgramAdminItem
          const value =
            field === 'sortOrder' || field === 'parentProgramId'
              ? e.newValue === '' || e.newValue == null
                ? null
                : Number(e.newValue)
              : e.newValue
          onCellChange(e.data.id, field, value)
        }}
      />
    </div>
  )
}

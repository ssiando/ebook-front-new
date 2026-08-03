import { useMemo } from 'react'
import { AgGridReact } from 'ag-grid-react'
import type { ColDef, SelectionChangedEvent } from 'ag-grid-community'
import { themeQuartz } from 'ag-grid-community'
import type { Role } from '@/types/role'

const gridTheme = themeQuartz.withParams({
  headerBackgroundColor: '#f9fafb',
  headerTextColor: '#374151',
  rowHoverColor: '#fef2f2',
  borderColor: '#e5e7eb',
  fontSize: 13,
})

interface RoleListGridProps {
  rows: Role[]
  loading: boolean
  selectedId: string | null
  onSelectRow: (id: string) => void
  onCellChange: (id: string, field: keyof Role, value: string) => void
  onSelectionChange: (ids: string[]) => void
}

export function RoleListGrid({
  rows,
  loading,
  selectedId,
  onSelectRow,
  onCellChange,
  onSelectionChange,
}: RoleListGridProps) {
  const columnDefs = useMemo<ColDef<Role>[]>(
    () => [
      { headerCheckboxSelection: true, checkboxSelection: true, width: 44, pinned: 'left' },
      { field: 'roleName', headerName: '역할명', width: 160, editable: true },
      { field: 'description', headerName: '설명', flex: 1, minWidth: 180, editable: true },
      { field: 'system', headerName: '시스템명', width: 110, editable: true },
      { field: 'memberCount', headerName: '소속 인원', width: 100 },
      { field: 'createdAt', headerName: '등록일시', width: 160 },
      { field: 'updatedAt', headerName: '수정일시', width: 160 },
    ],
    [],
  )

  return (
    <div style={{ height: 420 }}>
      <AgGridReact<Role>
        theme={gridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        loading={loading}
        rowHeight={40}
        headerHeight={40}
        rowSelection="multiple"
        suppressRowClickSelection
        getRowId={(p) => p.data.id}
        onRowClicked={(e) => e.data && onSelectRow(e.data.id)}
        onSelectionChanged={(e: SelectionChangedEvent<Role>) =>
          onSelectionChange(e.api.getSelectedRows().map((row) => row.id))
        }
        getRowStyle={(p) => (p.data?.id === selectedId ? { background: '#fef2f2' } : undefined)}
        onCellValueChanged={(e) => {
          if (!e.data || !e.colDef.field) return
          onCellChange(e.data.id, e.colDef.field as keyof Role, e.newValue)
        }}
      />
    </div>
  )
}
